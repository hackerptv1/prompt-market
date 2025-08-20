import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, GripVertical, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AdminModal } from './AdminModal';

// Define Category type
interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<{ name: string }>({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setCategories(data || []);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  // Open modal for add
  const handleAdd = () => {
    setModalMode('add');
    setForm({ name: '' });
    setEditingId(null);
    setFormError('');
    setModalOpen(true);
  };
  // Open modal for edit
  const handleEdit = (category: Category) => {
    setModalMode('edit');
    setForm({ name: category.name });
    setEditingId(category.id);
    setFormError('');
    setModalOpen(true);
  };
  // Delete category
  const handleDelete = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all subcategories under this category.`)) return;
    
    try {
      // First delete all subcategories
      const { error: subError } = await supabase
        .from('subcategories')
        .delete()
        .eq('category_id', categoryId);
      
      if (subError) throw subError;

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter((cat) => cat.id !== categoryId));
      // Dispatch event to notify subcategories list
      window.dispatchEvent(new Event('categoryDeleted'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required');
      setFormLoading(false);
      return;
    }

    try {
      if (modalMode === 'add') {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: form.name.trim() }])
          .select()
          .single();
        if (error) throw error;
        setCategories([data, ...categories]);
        // Dispatch event to notify subcategories list
        window.dispatchEvent(new Event('categoryCreated'));
      } else if (modalMode === 'edit' && editingId) {
        // First update the category
        const { data, error } = await supabase
          .from('categories')
          .update({ name: form.name.trim() })
          .eq('id', editingId)
          .select()
          .single();
        
        if (error) throw error;

        // Then update all subcategories that reference this category
        const { error: subError } = await supabase
          .from('subcategories')
          .update({ category: { name: form.name.trim() } })
          .eq('category_id', editingId);

        if (subError) throw subError;

        setCategories(categories.map((cat) => (cat.id === editingId ? data : cat)));
        // Dispatch event to notify subcategories list
        window.dispatchEvent(new Event('categoryUpdated'));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
    }

    setFormLoading(false);
    if (!formError) setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Main Categories</h2>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {loading ? (
        <div className="p-4 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-500">{error}</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <div key={category.id} className="p-4 flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  onClick={() => handleEdit(category)}
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'add' ? 'Add Category' : 'Edit Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              disabled={formLoading}
            >
              {modalMode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}