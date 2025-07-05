// services/overpassService.js
const axios = require('axios');

/**
 * Fetch POIs (temples, monuments, museums, forts, etc.)
 * within a radius (m) of a coordinate using Overpass API.
 *
 * @param {Number} lat  Latitude
 * @param {Number} lon  Longitude
 * @param {Number} radiusM  Radius in metres (20 km = 20000)
 */
exports.getPois = async (lat, lon, radiusM = 15000) => {
  // Overpass QL query. `~"^(temple|museum|monument|fort)$"` matches values.
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="attraction"](around:${radiusM},${lat},${lon});
      node["historic"](around:${radiusM},${lat},${lon});
    );
    out center 30;
  `;

  const url = 'https://overpass-api.de/api/interpreter';
  const res = await axios.post(url, query, {
    headers: { 'Content-Type': 'text/plain' }
  });

  // Map to simplified objects
  return (res.data.elements || []).map((el) => ({
    title: el.tags?.name || 'Unnamed POI',
    lat: el.lat,
    lon: el.lon,
    osmId: el.id,
    rawTags: el.tags
  }));
};
