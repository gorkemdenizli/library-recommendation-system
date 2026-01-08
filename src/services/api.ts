import { fetchAuthSession } from 'aws-amplify/auth';
import { Book, ReadingList, Review, Recommendation } from '@/types';
import { mockReadingLists } from './mockData';


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
 * Get user's reading lists
 *
 * TODO: Replace with real API call in Week 2, Day 5-7
 *
 * Implementation steps:
 * 1. Deploy Lambda function: library-get-reading-lists
 * 2. Lambda should query DynamoDB by userId (from Cognito token)
 * 3. Create API Gateway endpoint: GET /reading-lists
 * 4. Add Cognito authorizer (Week 3)
 * 5. Replace mock code below with:
 *
 * const headers = await getAuthHeaders();
 * const response = await fetch(`${API_BASE_URL}/reading-lists`, {
 *   headers
 * });
 * if (!response.ok) throw new Error('Failed to fetch reading lists');
 * return response.json();
 *
 * Expected response: Array of ReadingList objects for the authenticated user
 */
export async function getReadingLists(): Promise<ReadingList[]> {
  // TODO: Remove this mock implementation after deploying Lambda
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockReadingLists), 500);
  });
}

/**
 * Create a new reading list
 *
 * TODO: Replace with real API call in Week 2, Day 5-7
 *
 * Implementation steps:
 * 1. Deploy Lambda function: library-create-reading-list
 * 2. Lambda should generate UUID for id and timestamps
 * 3. Lambda should get userId from Cognito token
 * 4. Create API Gateway endpoint: POST /reading-lists
 * 5. Add Cognito authorizer (Week 3)
 * 6. Replace mock code below with:
 *
 * const headers = await getAuthHeaders();
 * const response = await fetch(`${API_BASE_URL}/reading-lists`, {
 *   method: 'POST',
 *   headers,
 *   body: JSON.stringify(list)
 * });
 * if (!response.ok) throw new Error('Failed to create reading list');
 * return response.json();
 *
 * Expected response: Complete ReadingList object with generated id and timestamps
 */

/* export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  // TODO: Remove this mock implementation after deploying Lambda
  return new Promise((resolve) => {
    setTimeout(() => {
      const newList: ReadingList = {
        ...list,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      resolve(newList);
    }, 500);
  });
}
*/

export async function createReadingList(
  list: Omit<ReadingList, "id" | "createdAt" | "updatedAt">
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
 * TODO: Replace with PUT /reading-lists/:id API call
 */
export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingList = mockReadingLists.find((l) => l.id === id);
      const updatedList: ReadingList = {
        ...existingList!,
        ...list,
        id,
        updatedAt: new Date().toISOString(),
      };
      resolve(updatedList);
    }, 500);
  });
}

/**
 * Delete a reading list
 * TODO: Replace with DELETE /reading-lists/:id API call
 */
export async function deleteReadingList(): Promise<void> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300);
  });
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
