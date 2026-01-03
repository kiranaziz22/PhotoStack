export const config = {
  // In production, use relative URL since frontend is served from same origin
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api'),
  appName: 'PhotoStack',
  defaultPageSize: 12,
};
