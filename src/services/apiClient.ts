export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your connection and try again.');
    }
    throw new Error('Network error: Unable to reach the server.');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Simulates network latency for mock API calls
 * @param data The mock data to return
 * @param delay Simulated delay in ms (default 800ms)
 * @param shouldFail Simulate an error (10% chance if set to 'random', or strictly boolean)
 */
export async function simulateApiCall<T>(data: T, delay = 800, shouldFail: boolean | 'random' = false): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const willFail = shouldFail === 'random' ? Math.random() < 0.1 : shouldFail;
      if (willFail) {
        reject(new Error('Network request failed. Please try again later.'));
      } else {
        resolve(data);
      }
    }, delay);
  });
}
