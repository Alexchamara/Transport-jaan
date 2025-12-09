/**
 * API Configuration
 * Base URL for all API requests
 */
export const API_BASE_URL = "https://transport.jaan.lk/";

/**
 * Helper function to construct full API URL
 * @param {string} endpoint - The API endpoint (e.g., '/vendors/warehouse/api/units')
 * @returns {string} - The full API URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
