import {
    calculatePolygonArea,
    removeRedundantPointsInRing,
    roundCoordinate,
} from "@eria-viz/map-utils";

/**
 * Polygon簡略化
 */
export function simplifyPolygon(
  geom: any,
  prec: number,
  areaThres: number,
  zoom: number,
) {
  const newCoordinates = geom.coordinates
    .map((ring: number[][]) => {
      let roundedRing = ring.map((coord) =>
        roundCoordinate(coord, zoom - 1, prec),
      );
      roundedRing = removeRedundantPointsInRing(roundedRing);
      return roundedRing;
    })
    .filter((ring: number[][]) => {
      const area = calculatePolygonArea(ring);
      return area > areaThres / Math.pow(2, zoom - 1);
    });
  return { ...geom, coordinates: newCoordinates };
}

/**
 * MultiPolygon簡略化
 */
export function simplifyMultiPolygon(
  geom: any,
  precision: number,
  areaThreshold: number,
  zoom: number,
) {
  const newCoordinates = geom.coordinates
    .map((polygon: number[][][]) => {
      return polygon.map((ring: number[][]) => {
        let roundedRing = ring.map((coord) =>
          roundCoordinate(coord, zoom - 1, precision),
        );
        roundedRing = removeRedundantPointsInRing(roundedRing);
        return roundedRing;
      });
      //return turf.(turf.simplify(turf.polygon(polygon), 1, false));
    })
    .map(
      (polygon: number[][][]) =>
        polygon.filter((p: number[][], index: number) => p.length >= 1),
      /*
                    .filter((ring: number[][]) => {
                      const area = calculatePolygonArea(ring);
                      return area > areaThreshold;
                    }),*/
    )
    .filter((polygon: number[][][]) => polygon.length >= 1);
  return { ...geom, coordinates: newCoordinates };
}
