import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  getReadingLists,
  createReadingList,
  updateReadingList,
  deleteReadingList,
} from '@/services/api';
import { ReadingList } from '@/types';
import { formatDate } from '@/utils/formatters';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

export function ReadingLists() {
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ReadingList | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      const data = await getReadingLists();
      setLists(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }

    try {
      setIsSaving(true);
      const created = await createReadingList({
        name: newListName.trim(),
        description: newListDescription,
        bookIds: [],
      });

      setLists((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
      setNewListName('');
      setNewListDescription('');
      showSuccess('Reading list created successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (list: ReadingList) => {
    setSelectedList(list);
    setEditName(list.name ?? '');
    setEditDescription(list.description ?? '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedList(null);
    setEditName('');
    setEditDescription('');
  };

  const handleUpdateList = async () => {
    if (!selectedList) return;
    if (!editName.trim()) {
      alert('Please enter a list name');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateReadingList(selectedList.id, {
        name: editName.trim(),
        description: editDescription,
      });

      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      closeEditModal();
      showSuccess('Reading list updated successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;

    const confirmed = window.confirm(`Delete reading list "${selectedList.name}"?`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteReadingList(selectedList.id);
      setLists((prev) => prev.filter((l) => l.id !== selectedList.id));
      closeEditModal();
      showSuccess('Reading list deleted successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">My Reading Lists</h1>
            <p className="text-slate-600 text-lg">Organize your books into custom lists</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setIsCreateModalOpen(true)}>
            Create New List
          </Button>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No reading lists yet</h3>
            <p className="text-slate-600 mb-4">Create your first list to start organizing your books</p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
                onClick={() => openEditModal(list)}
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">{list.name}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2">{list.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{list.bookIds.length} books</span>
                  <span>Created {formatDate(list.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Reading List"
        >
          <div>
            <Input
              label="List Name"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., Summer Reading 2024"
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="What's this list about?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleCreateList} className="flex-1" disabled={isSaving}>
                Create List
              </Button>
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Reading List">
          <div>
            <Input
              label="List Name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleUpdateList} className="flex-1" disabled={isSaving}>
                Save
              </Button>
              <Button variant="secondary" onClick={handleDeleteList} className="flex-1" disabled={isDeleting}>
                Delete
              </Button>
              <Button variant="secondary" onClick={closeEditModal} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
