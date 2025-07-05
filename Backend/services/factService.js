// services/factService.js
const axios = require('axios');

/**
 * Get historical events within 20 km of a given lat/lon using Wikidata SPARQL.
 */
exports.getHistoricalFacts = async (lat, lon, radius = 20) => {
  const sparqlQuery = `
    SELECT ?event ?eventLabel ?coord ?time ?desc WHERE {
      ?event wdt:P31 wd:Q1190554.     # instance of historical event
      ?event wdt:P625 ?coord.
      OPTIONAL { ?event wdt:P585 ?time. }
      OPTIONAL { ?event schema:description ?desc FILTER (lang(?desc) = "en") }
      SERVICE wikibase:around {
        ?event wdt:P625 ?loc .
        bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
        bd:serviceParam wikibase:radius "${radius}" .
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 5
  `;

  const encodedQuery = encodeURIComponent(sparqlQuery);
  const url = `https://query.wikidata.org/sparql?query=${encodedQuery}`;
  
  try {
    const res = await axios.get(url, {
      headers: { Accept: 'application/sparql-results+json' }
    });

    return res.data.results.bindings.map((item) => ({
      title: item.eventLabel?.value,
      summary: item.desc?.value || 'No summary available.',
      date: item.time?.value || null,
      lat,
      lon
    }));
  } catch (err) {
    console.error("Wikidata SPARQL failed:", err.message);
    return [];
  }
};
