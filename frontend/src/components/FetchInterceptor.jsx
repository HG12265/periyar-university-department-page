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

function installInterceptor() {
  if (typeof window === 'undefined') return;
  if (window.__FETCH_INTERCEPTOR_INSTALLED__) return;
  window.__FETCH_INTERCEPTOR_INSTALLED__ = true;

  const originalFetch = window.fetch;

  window.fetch = async function (url, options = {}) {
    let urlString = typeof url === 'string' ? url : (url && url.url) || '';

    // Auto-align API host to current origin if accessing periyaruniversity.ac.in
    // (e.g. if page is loaded on periyaruniversity.ac.in without www, normalize www.periyaruniversity.ac.in to same origin)
    if (window.location && window.location.hostname && window.location.hostname.includes('periyaruniversity.ac.in')) {
      const currentOrigin = window.location.origin;
      if (urlString.startsWith('https://www.periyaruniversity.ac.in/api')) {
        urlString = urlString.replace('https://www.periyaruniversity.ac.in/api', `${currentOrigin}/api`);
      } else if (urlString.startsWith('https://periyaruniversity.ac.in/api')) {
        urlString = urlString.replace('https://periyaruniversity.ac.in/api', `${currentOrigin}/api`);
      } else if (urlString.startsWith('http://www.periyaruniversity.ac.in/api')) {
        urlString = urlString.replace('http://www.periyaruniversity.ac.in/api', `${currentOrigin}/api`);
      } else if (urlString.startsWith('http://periyaruniversity.ac.in/api')) {
        urlString = urlString.replace('http://periyaruniversity.ac.in/api', `${currentOrigin}/api`);
      }

      if (typeof url === 'string') {
        url = urlString;
      } else if (url && url.url) {
        url = new Request(urlString, url);
      }
    }

    // Capture all fetch requests directed to the backend API
    const isApiRequest = urlString.includes('/api') || urlString.startsWith('/api/') || urlString.includes('periyaruniversity.ac.in');
    if (isApiRequest) {
      if (!options) options = {};
      // Enforce cookie transport via credentials: "include"
      options.credentials = 'include';

      // Prepare request headers structure
      if (!options.headers) {
        options.headers = {};
      }

      const isHeadersInstance = options.headers instanceof Headers;
      const method = (options.method || 'GET').toUpperCase();

      // Inject the Double-Submit CSRF token header for all mutating HTTP verbs
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
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
}

// Immediate execution upon script evaluation in browser
if (typeof window !== 'undefined') {
  installInterceptor();
}

export default function FetchInterceptor() {
  useEffect(() => {
    installInterceptor();
  }, []);

  return null;
}
