// const axios = require('axios');
// const { getMidpoints, haversineDistance } = require('../utils/geoUtils');

// exports.getLandmarksAlongRoute = async (routeCoords) => {
//   const points = getMidpoints(routeCoords, 20); // every ~20 km
//   const results = [];

//   for (const [lat, lon] of points) {
//     const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=20000&gslimit=10&format=json&origin=*`;
//     const geoRes = await axios.get(geoUrl);

//     const geoData = geoRes.data;

//     if (!geoData.query || !geoData.query.geosearch) {
//     console.warn(`No geosearch results found for ${lat}, ${lon}`);
//     continue;
//     }
    
//     for (const landmark of geoData.query.geosearch) {
//       const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(landmark.title)}`;
//       const summaryRes = await axios.get(summaryUrl);

//       results.push({
//         title: summaryRes.data.title,
//         summary: summaryRes.data.extract,
//         thumbnail: summaryRes.data.thumbnail?.source || '',
//         lat: landmark.lat,
//         lon: landmark.lon,
//         distance: haversineDistance(lat, lon, landmark.lat, landmark.lon)
//       });
//     }
//   }

//   return results;
// };

// exports.getHistoricalFacts = async (routeCoords) => {
//   const center = routeCoords[Math.floor(routeCoords.length / 2)];
//   const lat = center[0], lon = center[1];

//   const res = await axios.get(
//     `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=20000&gslimit=15&format=json&origin=*`
//   );

//   const geoResults = res.data?.query?.geosearch;

//   if (!geoResults || geoResults.length === 0) {
//     console.warn(`No historical facts found near ${lat}, ${lon}`);
//     return [];
//   }

//   const facts = await Promise.all(geoResults.map(async (loc) => {
//     const summaryRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(loc.title)}`);
//     return {
//       title: summaryRes.data.title,
//       summary: summaryRes.data.extract,
//       lat: loc.lat,
//       lon: loc.lon
//     };
//   }));

//   return facts;
// };

// services/wikiService.js
const axios = require('axios');

exports.getSummaryByTitle = async (title) => {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await axios.get(url);
    return {
      title: res.data.title,
      summary: res.data.extract,
      thumbnail: res.data.thumbnail?.source || ''
    };
  } catch (err) {
    // If page not found, return null
    return null;
  }
};

