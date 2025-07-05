// services/locationService.js
const axios = require('axios');

/**
 * Reverse geocode a lat/lon into a place name using Nominatim (OpenStreetMap)
 */
exports.getPlaceNameFromCoords = async (lat, lon) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;

  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'GeoNarrator-App' }
    });

    const address = res.data.address;
    return (
      address.city || address.town || address.village ||
      address.state || address.county || null
    );
  } catch (err) {
    console.error('Reverse geocoding failed:', err.message);
    return null;
  }
};

/**
 * Get Wikidata QID from a place name using Wikidata Search API
 */
exports.getWikidataQID = async (placeName) => {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(placeName)}&language=en&format=json`;

  try {
    const res = await axios.get(url);
    return res.data.search?.[0]?.id || null;
  } catch (err) {
    console.error('Wikidata QID lookup failed:', err.message);
    return null;
  }
};
