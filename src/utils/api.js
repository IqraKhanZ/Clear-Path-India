import i18n from 'i18next';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    throw new Error('Unauthorized');
  }

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const errorMsg = data.message || (i18n.language === 'hi' ? 'कुछ गलत हो गया।' : 'Something went wrong.');
    throw new Error(errorMsg);
  }
  
  return data;
};

const handleError = (error) => {
  if (error.message === 'Unauthorized') {
    throw error;
  }
  // Handle connection/network errors
  if (error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
    const netErrorMsg = i18n.language === 'hi'
      ? 'सर्वर से कनेक्ट करने में विफल। कृपया अपना इंटरनेट कनेक्शन जांचें।'
      : 'Failed to connect to the server. Please check your internet connection.';
    throw new Error(netErrorMsg);
  }
  throw error;
};

export const api = {
  get: async (path) => {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },
  
  post: async (path, body) => {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },
  
  patch: async (path, body) => {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },
  
  del: async (path) => {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
      });
      return await handleResponse(response);
    } catch (err) {
      handleError(err);
    }
  },
};

export default api;
