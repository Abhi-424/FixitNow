const axios = require('axios');

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode an address to coordinates
 * @param {string} address 
 * @returns {Promise<{lat: number, lng: number, display_name: string} | null>}
 */
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(NOMINATIM_BASE_URL, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'FixItNow-App/1.0' // Required by Nominatim
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

module.exports = { geocodeAddress };
