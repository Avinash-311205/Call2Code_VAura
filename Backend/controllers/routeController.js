// controllers/routeController.js
const orsService       = require('../services/orsService');
const overpassService  = require('../services/overpassService');
const wikiService      = require('../services/wikiService');
const factService      = require('../services/factService');
const locationService  = require('../services/locationService');
const { getMidpoints } = require('../utils/geoUtils');

exports.getRouteStories = async (req, res) => {
  const { origin, destination } = req.body;

  try {
    // 1. Get route polyline from ORS
    const routeCoords = await orsService.getRoute(origin, destination);

    if (!routeCoords || routeCoords.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Route data insufficient.' });
    }

    // --- landmark pipeline --------------------------------------------------

    // 2. Sample mid‑points every 20 km (adjust as needed)
    const samplePts = getMidpoints(routeCoords, 20);

    // 3. Collect POIs from Overpass around each mid‑point
    const poiPromises = samplePts.map(([lat, lon]) =>
      overpassService.getPois(lat, lon)
    );
    const allPois = (await Promise.all(poiPromises)).flat();

    // 4. Deduplicate POIs by OSM id
    const uniquePois = Object.values(
      allPois.reduce((acc, p) => ({ ...acc, [p.osmId]: p }), {})
    );

    // 5. Attach Wikipedia summaries
    const enrichedPois = await Promise.all(
      uniquePois.map(async (poi) => {
        if (!poi.title || poi.title.startsWith('Unnamed')) return null;
        const summary = await wikiService.getSummaryByTitle(poi.title);
        return summary ? { ...poi, ...summary } : null;
      })
    );
    const landmarks = enrichedPois.filter(Boolean);

    // --- facts pipeline (Wikipedia summary for start & destination) ---------

    // 6. Extract start & end coordinates
    const [startLat, startLon] = routeCoords[0];
    const [endLat,   endLon]   = routeCoords[routeCoords.length - 1];

    // 7. Reverse‑geocode to place names
    const startPlace = await locationService.getPlaceNameFromCoords(startLat, startLon);
    const endPlace   = await locationService.getPlaceNameFromCoords(endLat,   endLon);

    // 8. Fetch concise Wikipedia summaries
    const startFacts = startPlace ? await factService.getWikipediaSummary(startPlace) : null;
    const endFacts   = endPlace   ? await factService.getWikipediaSummary(endPlace)   : null;

    const facts = [];
    if (startFacts) facts.push({
      place: startFacts.title,
      paragraphs: startFacts.summary,   // already split into mini‑paras
      url: startFacts.sourceUrl
    });
    if (endFacts && endFacts.title !== startFacts?.title) facts.push({
      place: endFacts.title,
      paragraphs: endFacts.summary,
      url: endFacts.sourceUrl
    });

    // --- send unified response ---------------------------------------------

    res.status(200).json({
      status: 'success',
      polyline: routeCoords,
      landmarks,
      facts           // will contain 1–2 items with tidy paragraphs
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
