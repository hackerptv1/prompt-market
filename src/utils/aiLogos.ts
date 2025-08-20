import { supabase } from '../lib/supabaseClient';

export interface AILogo {
  id: string;
  platform_name: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

// Helper function to extract file path from Supabase storage URL
const extractFilePathFromUrl = (url: string): string | null => {
  try {
    // Check if it's a Supabase storage URL
    if (!url.includes('/storage/v1/object/public/')) {
      return null; // Not a storage URL, so no file to delete
    }
    
    // Extract the path part after the bucket name
    const parts = url.split('/storage/v1/object/public/');
    if (parts.length < 2) return null;
    
    const pathParts = parts[1].split('/');
    if (pathParts.length < 2) return null;
    
    // Remove the bucket name and return the file path
    return pathParts.slice(1).join('/');
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
};

// Helper function to delete old logo file from storage
const deleteOldLogoFile = async (oldLogoUrl: string, bucketName: string) => {
  try {
    const filePath = extractFilePathFromUrl(oldLogoUrl);
    if (!filePath) {
      console.log('Old logo is not a storage file, skipping deletion');
      return;
    }
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting old logo file:', error);
      // Don't throw error as this is cleanup - the main operation should still succeed
    } else {
      console.log('Successfully deleted old logo file:', filePath);
    }
  } catch (error) {
    console.error('Error in deleteOldLogoFile:', error);
    // Don't throw error as this is cleanup
  }
};

// Function to add a new AI platform logo (Super Admin only)
export const addAILogo = async (platformName: string, logoUrl: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_platform_logos')
      .insert([
        {
          platform_name: platformName,
          logo_url: logoUrl,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding AI logo:', error);
    throw error;
  }
};

// Function to fetch all AI platform logos
export const fetchAILogos = async () => {
  try {
    const { data, error } = await supabase
      .from('ai_platform_logos')
      .select('*')
      .order('platform_name');

    if (error) throw error;
    return data as AILogo[];
  } catch (error) {
    console.error('Error fetching AI logos:', error);
    throw error;
  }
};

// Function to fetch a specific AI platform logo
export const fetchAILogo = async (platformName: string) => {
  try {
    const { data, error } = await supabase
      .from('ai_platform_logos')
      .select('*')
      .eq('platform_name', platformName)
      .single();

    if (error) throw error;
    return data as AILogo;
  } catch (error) {
    console.error('Error fetching AI logo:', error);
    throw error;
  }
};

// Function to update an AI platform logo (Super Admin only)
export const updateAILogo = async (platformName: string, newLogoUrl: string) => {
  try {
    // First, get the current logo URL to delete the old file
    const currentLogo = await fetchAILogo(platformName);
    
    // Update the database record
    const { data, error } = await supabase
      .from('ai_platform_logos')
      .update({ logo_url: newLogoUrl })
      .eq('platform_name', platformName)
      .select()
      .single();

    if (error) throw error;
    
    // Delete the old logo file if it exists and is different from the new one
    if (currentLogo && currentLogo.logo_url !== newLogoUrl) {
      await deleteOldLogoFile(currentLogo.logo_url, 'ai-platform-logos');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating AI logo:', error);
    throw error;
  }
};

// Function to delete an AI platform logo (Super Admin only)
export const deleteAILogo = async (platformName: string) => {
  try {
    // First, get the current logo URL to delete the file
    const currentLogo = await fetchAILogo(platformName);
    
    // Delete the database record
    const { error } = await supabase
      .from('ai_platform_logos')
      .delete()
      .eq('platform_name', platformName);

    if (error) throw error;
    
    // Delete the logo file if it exists
    if (currentLogo) {
      await deleteOldLogoFile(currentLogo.logo_url, 'ai-platform-logos');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting AI logo:', error);
    throw error;
  }
}; 