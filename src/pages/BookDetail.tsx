import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Modal } from '@/components/common/Modal';
import { getBook, getReadingLists, updateReadingList } from '@/services/api';
import type { Book, ReadingList } from '@/types';
import { formatRating } from '@/utils/formatters';
import { handleApiError } from '@/utils/errorHandling';

/**
 * BookDetail page component
 */
export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reading lists state
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [isListsLoading, setIsListsLoading] = useState(false);

  // Add-to-list modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      loadBook(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadReadingLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBook = async (bookId: string) => {
    setIsLoading(true);
    try {
      const data = await getBook(bookId);
      if (!data) {
        navigate('/404');
        return;
      }
      setBook(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReadingLists = async () => {
    setIsListsLoading(true);
    try {
      const lists = await getReadingLists();
      setReadingLists(lists);

      // default selection
      if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      } else {
        setSelectedListId('');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsListsLoading(false);
    }
  };

  const handleAddToList = async () => {
    // Modal açmadan önce listeleri yenilemek iyi olur (başka sayfada değişmiş olabilir)
    await loadReadingLists();
    setIsAddModalOpen(true);
  };

  const handleConfirmAddToList = async () => {
    if (!book) return;

    if (!selectedListId) {
      alert('Please select a reading list');
      return;
    }

    const target = readingLists.find((l) => l.id === selectedListId);
    if (!target) {
      alert('Selected reading list not found');
      return;
    }

    // Duplicate engelle
    const currentIds = Array.isArray(target.bookIds) ? target.bookIds.map(String) : [];
    if (currentIds.includes(String(book.id))) {
      alert('This book is already in the selected reading list.');
      return;
    }

    try {
      setIsAdding(true);

      const nextBookIds = [...currentIds, String(book.id)];
      await updateReadingList(selectedListId, { bookIds: nextBookIds });

      // UI state güncelle
      setReadingLists((prev) =>
        prev.map((l) => (l.id === selectedListId ? { ...l, bookIds: nextBookIds } : l))
      );

      setIsAddModalOpen(false);
      alert('Book added to reading list!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-violet-600 mb-8 transition-colors group glass-effect px-4 py-2 rounded-xl border border-white/20 w-fit"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back</span>
        </button>

        <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12">
            <div className="md:col-span-1">
              <div className="relative group">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full rounded-2xl shadow-2xl group-hover:shadow-glow transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-slate-600 mb-6 font-medium">by {book.author}</p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
                  <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-amber-700">{formatRating(book.rating)}</span>
                </div>

                <span className="badge-gradient px-4 py-2 text-sm">{book.genre}</span>

                <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold">{book.publishedYear}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full mr-3"></span>
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg">{book.description}</p>
              </div>

              <div className="mb-8 glass-effect p-4 rounded-xl border border-white/20">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">ISBN:</span> {book.isbn}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={handleAddToList}>
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Reading List
                </Button>

                <Button variant="outline" size="lg">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Write a Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section placeholder */}
        <div className="mt-8 glass-effect rounded-3xl shadow-xl border border-white/20 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="w-1 h-8 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full mr-3"></span>
            Reviews
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <p className="text-slate-600 text-lg">Reviews section coming soon...</p>
          </div>
        </div>
      </div>

      {/* Add to Reading List Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add to Reading List">
        <div className="space-y-4">
          {isListsLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : readingLists.length === 0 ? (
            <div className="text-slate-700">
              You don’t have any reading lists yet. Create one from the Reading Lists page first.
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium text-slate-700">Select a list</label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              >
                {readingLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmAddToList}
                  disabled={isAdding || !selectedListId}
                  className="flex-1"
                >
                  {isAdding ? 'Adding...' : 'Add'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
