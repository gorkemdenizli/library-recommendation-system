import { fetchAuthSession } from 'aws-amplify/auth';
import { Book, ReadingList, Review, Recommendation } from '@/types';
import { mockBooks, mockReadingLists } from './mockData';


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
 *
 * TODO: Replace with real API call in Week 2, Day 3-4
 *
 * Implementation steps:
 * 1. Deploy Lambda function: library-get-books (see IMPLEMENTATION_GUIDE.md)
 * 2. Create API Gateway endpoint: GET /books
 * 3. Uncomment API_BASE_URL at top of file
 * 4. Replace mock code below with:
 *
 * const response = await fetch(`${API_BASE_URL}/books`);
 * if (!response.ok) throw new Error('Failed to fetch books');
 * return response.json();
 *
 * Expected response: Array of Book objects from DynamoDB
 */

// Update getBooks function:
export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}


/**
 * Get a single book by ID
 *
 * TODO: Replace with real API call in Week 2, Day 3-4
 *
 * Implementation steps:
 * 1. Deploy Lambda function: library-get-book (see IMPLEMENTATION_GUIDE.md)
 * 2. Create API Gateway endpoint: GET /books/{id}
 * 3. Replace mock code below with:
 *
 * const response = await fetch(`${API_BASE_URL}/books/${id}`);
 * if (response.status === 404) return null;
 * if (!response.ok) throw new Error('Failed to fetch book');
 * return response.json();
 *
 * Expected response: Single Book object or null if not found
 */

export async function getBook(id: string): Promise<Book | null> {
  if (!id) {
    console.error('Invalid book ID:', id);
    return null;
  }

  try {
    const response = await fetch(`/api/books/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }

    console.log('Fetched Book:', data);
    return data || null;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
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


/**
 * Get AI-powered book recommendations using Amazon Bedrock
 *
 * TODO: Replace with real API call in Week 4, Day 1-2
 *
 * Implementation steps:
 * 1. Enable Bedrock model access in AWS Console (Claude 3 Haiku recommended)
 * 2. Deploy Lambda function: library-get-recommendations (see IMPLEMENTATION_GUIDE.md)
 * 3. Create API Gateway endpoint: POST /recommendations
 * 4. Add Cognito authorizer
 * 5. Update function signature to accept query parameter:
 *    export async function getRecommendations(query: string): Promise<Recommendation[]>
 * 6. Replace mock code below with:
 *
 * const headers = await getAuthHeaders();
 * const response = await fetch(`${API_BASE_URL}/recommendations`, {
 *   method: 'POST',
 *   headers,
 *   body: JSON.stringify({ query })
 * });
 * if (!response.ok) throw new Error('Failed to get recommendations');
 * const data = await response.json();
 * return data.recommendations;
 *
 * Expected response: Array of recommendations with title, author, reason, confidence
 *
 * Documentation: https://docs.aws.amazon.com/bedrock/latest/userguide/
 */

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
