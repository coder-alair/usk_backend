// Calculate the distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Check if a location is within a certain radius
function isWithinRadius(lat1, lon1, location2, radiusKm) {
    const distance = calculateDistance(lat1, lon1, location2.latitude, location2.longitude);
    return distance <= radiusKm;
}

module.exports = { calculateDistance, isWithinRadius };