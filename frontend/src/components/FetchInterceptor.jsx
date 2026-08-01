'use client';

import { useEffect } from 'react';

// Helper to extract a cookie's value client-side
function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

export default function FetchInterceptor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;

    window.fetch = async function (url, options = {}) {
      const urlString = typeof url === 'string' ? url : (url && url.url) || '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

      // Capture all fetch requests directed to the FastAPI backend API
      if (urlString.includes(apiUrl) || urlString.startsWith('/api/')) {
        // Enforce cookie transport via credentials: "include"
        options.credentials = 'include';

        // Prepare request headers structure
        if (!options.headers) {
          options.headers = {};
        }

        const isHeadersInstance = options.headers instanceof Headers;
        const method = (options.method || 'GET').toUpperCase();

        // Inject the Double-Submit CSRF token header for all mutating HTTP verbs
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
          const csrfToken = getCookie('csrf_token');
          if (csrfToken) {
            if (isHeadersInstance) {
              options.headers.set('X-CSRF-Token', csrfToken);
            } else {
              options.headers['X-CSRF-Token'] = csrfToken;
            }
          }
        }
      }

      return originalFetch(url, options);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
