// DEPRECATED: This HTTP client is no longer used.
// All services now use mock data from lib/mockData.ts
// This file is kept for reference only and should not be imported.

console.warn('api.ts: HTTP client is deprecated. All services now use mock data.');

// Dummy export to prevent build errors if something still imports this
export default {
  get: () => Promise.reject(new Error('HTTP client disabled - using mock data')),
  post: () => Promise.reject(new Error('HTTP client disabled - using mock data')),
  put: () => Promise.reject(new Error('HTTP client disabled - using mock data')),
  delete: () => Promise.reject(new Error('HTTP client disabled - using mock data')),
};