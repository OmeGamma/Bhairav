export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
