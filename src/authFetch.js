/**
 * authFetch — authenticated fetch wrapper for Debrief.io
 *
 * Automatically attaches the JWT Bearer token from localStorage to
 * every request. On 401 (token expired / invalid), clears storage
 * and reloads to the login page.
 *
 * Usage — replace:
 *   fetch('/api/v1/meetings')
 * With:
 *   authFetch('/api/v1/meetings')
 *
 * For multipart file uploads, do NOT set Content-Type manually —
 * let the browser set it with the correct boundary:
 *   authFetch('/api/v1/meetings/upload-audio', { method: 'POST', body: formData })
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('authToken');

  // Build headers — merge caller's headers with Authorization
  const headers = {
    ...(options.headers || {}),
  };

  // Only set Authorization if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if the body is NOT FormData
  // (FormData needs the browser to set its own multipart boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle expired / invalid tokens globally
  if (response.status === 401) {
    console.warn('authFetch: 401 Unauthorized — clearing session and redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userDesignation');
    // Force a full page reload so App.jsx re-reads localStorage and shows LoginPage
    window.location.reload();
    // Return a dummy Response so callers don't crash before reload fires
    return new Response(null, { status: 401 });
  }

  return response;
}
