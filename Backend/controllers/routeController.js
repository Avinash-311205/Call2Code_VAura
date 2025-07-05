const orsService      = require('../services/orsService');
const overpassService = require('../services/overpassService');
const wikiService     = require('../services/wikiService');
const { getMidpoints } = require('../utils/geoUtils');
const factService = require('../services/factService');

exports.getRouteStories = async (req, res) => {
  const { origin, destination } = req.body;
  try {
    // 1. Route polyline
    const routeCoords = await orsService.getRoute(origin, destination);

    // 2. Pick mid‑points every 20 km (can lower to 10 km)
    const samplePts = getMidpoints(routeCoords, 20);

    // 3. Aggregate POIs from Overpass for each sample point
    const poiPromises = samplePts.map(([lat, lon]) =>
      overpassService.getPois(lat, lon)
    );
    const poisNested  = await Promise.all(poiPromises);
    const allPois     = poisNested.flat();

    // 4. De‑duplicate by OSM id
    const uniquePois = Object.values(
      allPois.reduce((acc, p) => ({ ...acc, [p.osmId]: p }), {})
    );

    // 5. Attach Wikipedia summary where title exists
    const enriched = await Promise.all(
      uniquePois.map(async (poi) => {
        if (!poi.title || poi.title.startsWith('Unnamed')) return null;
        const summary = await wikiService.getSummaryByTitle(poi.title);
        if (!summary) return null;
        return { ...poi, ...summary };
      })
    );

    const landmarks = enriched.filter(Boolean);

    // 6. Fetch historical facts along the route
    const factPromises = samplePts.map(([lat, lon]) =>
    factService.getHistoricalFacts(lat, lon)
    );
    const factsNested = await Promise.all(factPromises);
    const facts = factsNested.flat();


    // 7. Send response
    res.status(200).json({
        status: 'success',
        polyline: routeCoords,
        landmarks,
        facts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
