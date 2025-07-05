exports.getMidpoints = (coords, stepKm = 20) => {
  const result = [];
  let accumulated = 0;

  for (let i = 1; i < coords.length; i++) {
    const [lat1, lon1] = coords[i - 1];
    const [lat2, lon2] = coords[i];
    const dist = exports.haversineDistance(lat1, lon1, lat2, lon2);

    accumulated += dist;
    if (accumulated >= stepKm) {
      result.push([lat2, lon2]);
      accumulated = 0;
    }
  }

  return result;
};

exports.haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
