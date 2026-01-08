import { fetchAuthSession } from 'aws-amplify/auth';
import { Book, ReadingList, Review, Recommendation } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
  }

  return headers;
}

// JWT payload decode (base64url)
function decodeJwtPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  const json = atob(padded);
  return JSON.parse(json);
}

/**
 * Cognito user id (sub) from idToken
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) throw new Error('Not authenticated');

  const payload = decodeJwtPayload(token);
  const sub = payload?.sub;

  if (!sub) throw new Error('User id (sub) not found in token');

  return String(sub);
}

/**
 * Get all books from the catalog
 */
// Update getBooks function:
export async function getBooks(): Promise<Book[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books`, { headers });
  if (!response.ok) throw new Error('Failed to fetch books');
  const data = await response.json();
  console.log('Books from API:', data);
  return data;
}


/**
 * Get a single book by ID
 */
export async function getBook(id: string): Promise<Book | null> {
  if (!id) {
    console.error('Invalid book ID:', id);
    return null;
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(id)}`, { headers });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch book');

  return response.json();
}

export async function createBook(book: {
  title: string;
  author: string;
  genre?: string;
  description?: string;
  coverImage?: string;
  rating?: number;
  publishedYear?: number;
  isbn?: string;
}): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers,
    body: JSON.stringify(book),
  });

  if (!response.ok) throw new Error("Failed to create book");
  return response.json();
}

/**
 * Update an existing book (admin only)
 * PUT /books/:id
 */
export async function updateBook(
  id: string,
  updates: Partial<{
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage: string;
    rating: number;
    publishedYear: number;
    isbn: string;
  }>
): Promise<Book> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/books/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update book");
  }

  return response.json();
}


export async function deleteBook(id: string): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/books/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete book");
  }
}

export async function getRecommendations(query: string): Promise<Recommendation[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('Failed to get recommendations');

  const data = await response.json();
  console.log(data); // Burada gelen veriyi logla
  return data.recommendations;
}


/**
 * Get User's Reading Lists (REAL API)
 */
export async function getReadingLists(): Promise<ReadingList[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, { headers });
  if (!response.ok) throw new Error('Failed to fetch reading lists');
  return response.json();
}

/**
 * Create a new reading list
*/
type CreateReadingListInput = {
  name: string;
  description?: string;
  bookIds: string[];
};

export async function createReadingList(
  list: CreateReadingListInput
): Promise<ReadingList> {

  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    method: "POST",
    headers,
    body: JSON.stringify(list),
  });

  if (!response.ok) throw new Error("Failed to create reading list");
  return response.json();
}


/**
 * Update a reading list
 */
export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(list),
  });
  if (!response.ok) throw new Error('Failed to update reading list');
  return response.json();
}

/**
 * Delete a reading list
 */
export async function deleteReadingList(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete reading list');
}

/**
 * Get reviews for a book
 * TODO: Replace with GET /books/:id/reviews API call
 */
export async function getReviews(bookId: string): Promise<Review[]> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          id: '1',
          bookId,
          userId: '1',
          rating: 5,
          comment: 'Absolutely loved this book! A must-read.',
          createdAt: '2024-11-01T10:00:00Z',
        },
      ];
      resolve(mockReviews);
    }, 500);
  });
}

/**
 * Create a new review
 * TODO: Replace with POST /books/:bookId/reviews API call
 */
export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      resolve(newReview);
    }, 500);
  });
}
