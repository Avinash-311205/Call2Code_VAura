const axios = require('axios');

/**
 * Get a short Wikipedia summary for any city/place
 */
exports.getWikipediaSummary = async (placeName) => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    return {
      title: data.title,
      summary: splitIntoParagraphs(data.extract),
      sourceUrl: data.content_urls?.desktop?.page || null
    };
  } catch (err) {
    console.error(`Wikipedia fetch failed for ${placeName}:`, err.message);
    return null;
  }
};

// Utility to split a paragraph into smaller ones
function splitIntoParagraphs(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];

  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push((sentences[i] || '') + ' ' + (sentences[i + 1] || ''));
  }

  return chunks; // Returns array of 2-sentence paragraphs
}
