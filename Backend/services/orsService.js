const axios = require('axios');

exports.getRoute = async (origin, destination) => {
    const [startLat, startLon] = origin.split(',').map(Number);
    const [endLat, endLon] = destination.split(',').map(Number);

    const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
            coordinates: [[startLon, startLat], [endLon, endLat]]
        },
        {
            headers: {
                Authorization: process.env.ORS_API_KEY,
                'Content-Type': 'application/json'
            }
        }
    );

    const coords = response.data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    return coords;
};
