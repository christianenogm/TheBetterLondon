/**
 * pointInPolygon.js
 * Ray-casting algorithm to determine if a lat/lng point is inside a GeoJSON polygon.
 */

/**
 * Tests whether a point is inside a polygon ring using the ray-casting algorithm.
 * @param {number} lat
 * @param {number} lng
 * @param {Array<[number, number]>} ring - array of [longitude, latitude] pairs (GeoJSON order)
 * @returns {boolean}
 */
function pointInRing(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Given a lat/lng coordinate, find which collection zone it belongs to
 * by testing against all GeoJSON polygon features.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {object} featureCollection - GeoJSON FeatureCollection with Polygon features
 * @returns {string|null} CollectionZone string (e.g. "A1", "CORE EAST") or null if not found
 */
export function findZoneForCoordinate(lat, lng, featureCollection) {
  for (const feature of featureCollection.features) {
    const { geometry, properties } = feature;
    if (geometry.type !== 'Polygon') continue;

    // coordinates[0] is the outer ring, further indices are holes (we ignore holes)
    const outerRing = geometry.coordinates[0];
    if (pointInRing(lat, lng, outerRing)) {
      return properties.CollectionZone;
    }
  }
  return null;
}
