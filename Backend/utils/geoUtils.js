const axios = require('axios');
const ORS_API = process.env.ORS_API_KEY;

async function geocode(locationName) {
  const url = `https://api.openrouteservice.org/geocode/search`;
  const res = await axios.get(url, {
    params: {
      api_key: ORS_API,
      text: locationName,
      size: 1
    }
  });
  const coords = res.data.features[0].geometry.coordinates;
  return { lon: coords[0], lat: coords[1] };
}

async function getRoute(startCoord, endCoord) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
  const res = await axios.post(url,
    {
      coordinates: [
        [startCoord.lon, startCoord.lat],
        [endCoord.lon, endCoord.lat]
      ]
    },
    {
      headers: {
        'Authorization': ORS_API,
        'Content-Type': 'application/json'
      }
    }
  );
  const coords = res.data.features[0].geometry.coordinates;
  return coords.map(([lon, lat]) => ({ lat, lon }));
}

function samplePoints(points, maxSamples = 5) {
  const step = Math.max(1, Math.floor(points.length / maxSamples));
  return points.filter((_, i) => i % step === 0);
}

async function getNearbyWiki(lat, lon) {
  const url = `https://en.wikipedia.org/w/api.php`;
  const res = await axios.get(url, {
    params: {
      action: "query",
      list: "geosearch",
      gscoord: `${lat}|${lon}`,
      gsradius: 1000,
      format: "json"
    }
  });
  const places = res.data.query.geosearch;
  return places.length > 0 ? places[0].title : null;
}

async function getSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await axios.get(url);
  return res.data.extract || "No summary available.";
}

async function getNarration(startName, endName, delaySec) {
  const start = await geocode(startName);
  const end = await geocode(endName);

  const route = await getRoute(start, end);
  const sampled = samplePoints(route, 5);

  const facts = [];
  for (const { lat, lon } of sampled) {
    const title = await getNearbyWiki(lat, lon);
    const summary = title ? await getSummary(title) : "No interesting article nearby.";
    facts.push({
      location: `${lat},${lon}`,
      title: title || "No title",
      summary
    });

    await new Promise((res) => setTimeout(res, delaySec * 1000));
  }

  return facts;
}

module.exports = { getNarration };
