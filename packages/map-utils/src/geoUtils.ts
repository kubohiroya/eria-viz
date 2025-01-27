/**
 * 座標を指定小数点以下桁数に丸める
 */
export function roundCoordinate(
  coord: number[],
  zoomLevel: number,
  precision: number,
): number[] {
  const factor = Math.pow(2, zoomLevel) * precision;
  return [
    Math.round(coord[0] / factor) * factor,
    Math.round(coord[1] / factor) * factor,
  ];
}

/**
 * リング内の連続する同一座標点を削除
 */
export function removeRedundantPointsInRing(ring: number[][]): number[][] {
  if (ring.length <= 1) return ring;
  const result: number[][] = [ring[0]];
  for (let i = 1; i < ring.length; i++) {
    const prev = result[result.length - 1];
    const current = ring[i];
    if (prev[0] === current[0] && prev[1] === current[1]) {
      continue;
    }
    result.push(current);
  }
  return result;
}

/**
 * ポリゴンの面積 (近似計算)
 */
export function calculatePolygonArea(coordinates: number[][]): number {
  let area = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    if (coordinates[i].length === 2 && coordinates[i + 1].length === 2) {
      const [x1, y1] = coordinates[i] as number[];
      const [x2, y2] = coordinates[i + 1] as number[];
      area += x1 * y2 - x2 * y1;
    }
  }
  return Math.abs(area) / 2;
  // return turf.area(turf.polygon(coordinates));
}

/**
 * バウンディングボックス計算 [minLng, minLat, maxLng, maxLat]
 */
export function calculateBoundingBox(
  geometry: any,
): [number, number, number, number] {
  let minLng = 180,
    minLat = 90;
  let maxLng = -180,
    maxLat = -90;

  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      for (const [lng, lat] of ring) {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
  } else {
    throw new Error("Unsupported geometry type: " + geometry.type);
  }
  if (minLat == 90 && maxLat == -90 && minLng == 180 && maxLng == -180) {
    console.log(geometry);
    throw new Error("Invalid geometry");
  }

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Slippy Map 方式のタイル計算（簡易例）
 * 与えられた bbox から、該当するすべての (z/x/y) タイル文字列を返す
 */
export function lonLatToTileXY(
  lon: number,
  lat: number,
  zoom: number,
): { x: number; y: number } {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom),
  );
  return { x, y };
}

/**
 * バウンディングボックス [minLon, minLat, maxLon, maxLat] を与えられたとき、
 * その範囲をカバーするすべてのタイル (zoom/x/y) を返す (日付変更線考慮なしの通常版)
 */
function getTilesNormal(
  bbox: [number, number, number, number],
  zoom: number,
): string[] {
  const [minLon, minLat, maxLon, maxLat] = bbox;

  // 北西端 (minLon, maxLat)、南東端 (maxLon, minLat) からタイル座標を計算
  const nw = lonLatToTileXY(minLon, maxLat, zoom);
  const se = lonLatToTileXY(maxLon, minLat, zoom);

  const minX = Math.min(nw.x, se.x);
  const maxX = Math.max(nw.x, se.x);
  const minY = Math.min(nw.y, se.y);
  const maxY = Math.max(nw.y, se.y);

  let tiles: string[] = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push(`${zoom}/${x}/${y}`);
    }
  }
  return tiles;
}

/**
 * バウンディングボックス [minLon, minLat, maxLon, maxLat] を与えられたとき、
 * 日付変更線をまたぐ場合にも対応して、範囲をカバーするすべてのタイル (zoom/x/y) を返す。
 */
export function getTilesForZoomLevel(
  bbox: [number, number, number, number],
  zoom: number,
): string[] {
  let [minLon, minLat, maxLon, maxLat] = bbox;

  // バウンディングボックスが日付変更線をまたぐ場合 (minLon > maxLon)
  // 例: [170, ..., -170, ...] など
  if (minLon <= maxLon) {
    // 通常ケース
    return getTilesNormal(bbox, zoom);
  } else {
    // 日付変更線をまたぐケース：
    //   バウンディングボックスを [minLon, minLat, 180, maxLat] と
    //   [-180, minLat, maxLon, maxLat] の2つに分割
    const bboxA: [number, number, number, number] = [
      minLon,
      minLat,
      180,
      maxLat,
    ];
    const bboxB: [number, number, number, number] = [
      -180,
      minLat,
      maxLon,
      maxLat,
    ];
    console.log(2, bbox);
    const tilesA = getTilesNormal(bboxA, zoom);
    console.log(3, bbox);
    const tilesB = getTilesNormal(bboxB, zoom);

    // 重複を排除して結合
    return Array.from(new Set([...tilesA, ...tilesB]));
  }
}

/**
 * Converts a given set of map tile numbers to cover the specified zoom level.
 * @param targetZoomLevel - The zoom level to convert to.
 * @param tileNumbers - An array of map tile numbers in the format "z/x/y".
 * @returns An array of map tile numbers covering the specified range at the target zoom level.
 */
function convertMapTiles(
  targetZoomLevel: number,
  tileNumbers: string[],
): string[] {
  const result: Set<string> = new Set();

  for (const tile of tileNumbers) {
    const [z, x, y] = tile.split("/").map(Number);

    if (targetZoomLevel > z) {
      // Zooming in: split tile into smaller tiles
      const zoomDifference = targetZoomLevel - z;
      const scale = Math.pow(2, zoomDifference);

      for (let dx = 0; dx < scale; dx++) {
        for (let dy = 0; dy < scale; dy++) {
          const newX = x * scale + dx;
          const newY = y * scale + dy;
          result.add(`${targetZoomLevel}/${newX}/${newY}`);
        }
      }
    } else if (targetZoomLevel < z) {
      // Zooming out: merge tiles into a larger tile
      const zoomDifference = z - targetZoomLevel;
      const scale = Math.pow(2, zoomDifference);

      const newX = Math.floor(x / scale);
      const newY = Math.floor(y / scale);
      result.add(`${targetZoomLevel}/${newX}/${newY}`);
    } else {
      // Same zoom level
      result.add(tile);
    }
  }

  return Array.from(result);
}

/*
// Example usage:
const tiles1 = ["9/454/202"];
const tiles2 = ["10/908/404", "10/909/404", "10/908/405", "10/909/405"];

// Zooming in
console.log(convertMapTiles(10, tiles1));
// Output: ["10/908/404", "10/909/404", "10/908/405", "10/909/405"]

// Zooming out
console.log(convertMapTiles(9, tiles2));
// Output: ["9/454/202"]
*/
