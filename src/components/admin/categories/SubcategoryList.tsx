import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, GripVertical, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AdminModal } from './AdminModal';

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  created_at?: string;
  updated_at?: string;
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

export function SubcategoryList() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<{ name: string; category_id: string }>({ name: '', category_id: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch subcategories from Supabase
  useEffect(() => {
    async function fetchSubcategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcategories')
        .select('*, category:category_id(id, name)')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setSubcategories(data || []);
      setLoading(false);
    }
    fetchSubcategories();
  }, []);

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) setError(error.message);
      else setCategories(data || []);
    }
    fetchCategories();

    // Add event listener for category creation
    const handleCategoryCreated = () => {
      console.log('Category created event received, refreshing categories...');
      fetchCategories();
    };

    const handleCategoryUpdated = () => {
      console.log('Category updated event received, refreshing categories...');
      fetchCategories();
    };

    const handleCategoryDeleted = () => {
      console.log('Category deleted event received, refreshing categories...');
      fetchCategories();
    };

    window.addEventListener('categoryCreated', handleCategoryCreated);
    window.addEventListener('categoryUpdated', handleCategoryUpdated);
    window.addEventListener('categoryDeleted', handleCategoryDeleted);

    // Cleanup
    return () => {
      window.removeEventListener('categoryCreated', handleCategoryCreated);
      window.removeEventListener('categoryUpdated', handleCategoryUpdated);
      window.removeEventListener('categoryDeleted', handleCategoryDeleted);
    };
  }, []);

  // Open modal for add
  const handleAdd = () => {
    setModalMode('add');
    setForm({ name: '', category_id: '' });
    setEditingId(null);
    setFormError('');
    setModalOpen(true);
  };
  // Open modal for edit
  const handleEdit = (subcategory: Subcategory) => {
    setModalMode('edit');
    setForm({ name: subcategory.name, category_id: subcategory.category_id });
    setEditingId(subcategory.id);
    setFormError('');
    setModalOpen(true);
  };
  // Delete subcategory
  const handleDelete = async (subcategoryId: string) => {
    if (!window.confirm('Delete this subcategory?')) return;
    const { error } = await supabase.from('subcategories').delete().eq('id', subcategoryId);
    if (!error) setSubcategories(subcategories.filter((sub) => sub.id !== subcategoryId));
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
    if (!form.category_id) {
      setFormError('Category is required');
      setFormLoading(false);
      return;
    }
    if (modalMode === 'add') {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{ name: form.name.trim(), category_id: form.category_id }])
        .select('*, category:category_id(id, name)')
        .single();
      if (error) setFormError(error.message);
      else setSubcategories([data, ...subcategories]);
    } else if (modalMode === 'edit' && editingId) {
      const { data, error } = await supabase
        .from('subcategories')
        .update({ name: form.name.trim(), category_id: form.category_id })
        .eq('id', editingId)
        .select('*, category:category_id(id, name)')
        .single();
      if (error) setFormError(error.message);
      else setSubcategories(subcategories.map((sub) => (sub.id === editingId ? data : sub)));
    }
    setFormLoading(false);
    if (!formError) setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subcategories</h2>
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
          {subcategories.map((subcategory) => (
            <div key={subcategory.id} className="p-4 flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
                <p className="text-sm text-gray-500">
                  {subcategory.category?.name || 'Uncategorized'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  onClick={() => handleEdit(subcategory)}
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  onClick={() => handleDelete(subcategory.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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