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

