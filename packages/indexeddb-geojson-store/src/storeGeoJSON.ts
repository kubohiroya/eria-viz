import {GeoJSONIndex, getGeoJSONDB } from "@eria-viz/indexeddb-geojson";
import { simplifyMultiPolygon, simplifyPolygon } from "./simplifyGeoJSON";
import { calculateBoundingBox, getTilesForZoomLevel } from "@eria-viz/map-utils";

/**
 * ダウンロード & GeoJSON解釈 & 保存
 *   - URLリストを受け取り
 *   - 失敗したURLがあればエラーをthrow or 戻り値で通知
 *   - 成功したらIndexedDBに保存
 */
export async function storeGeoJSON(
    databaseName: string,
    geojsonContentsList: Array<{ url: string; contents: any }>,
    precision: number,
    areaThreshold: number,
): Promise<{ failedUrls: string[]; parseErrorUrls: string[] }> {
  const db = getGeoJSONDB(databaseName);

  const failedUrls: string[] = [];
  const parseErrorUrls: string[] = [];

  // 2. GeoJSONパース確認
  for (const geoJsonContents of geojsonContentsList) {
    const { url, contents } = geoJsonContents;

    if (!contents.type || contents.type !== "FeatureCollection") {
      parseErrorUrls.push(`${url}: Not a valid FeatureCollection`);
    }

    if (parseErrorUrls.length > 0) {
      // 解析失敗がある場合も結果を返す
      return { failedUrls, parseErrorUrls };
    }

    // 3. 簡略化 & DB保存
    const { features } = geoJsonContents.contents;

    // Polygon / MultiPolygon
    for (const feature of features) {
      // GADMの国名や行政区画名 (例)
      const countryName = feature?.properties?.COUNTRY ?? "";
      const adminName1 = feature?.properties?.NAME_1 ?? "";
      const adminName2 = feature?.properties?.NAME_2 ?? "";
      const geom = feature.geometry;
      if (!geom) continue;

      // タイル文字列
      const zoomTileMap = new Map<number, string[]>();

      const zoomLevels = [2, 3, 4, 5, 6, 7, 8, 9];
      for (const zoom of zoomLevels) {
        // バウンディングボックス計算
        if (geom.type === "Polygon") {
          feature.geometry = simplifyPolygon(
            geom,
            precision,
            areaThreshold,
            zoom,
          );
        } else if (geom.type === "MultiPolygon") {
          feature.geometry = simplifyMultiPolygon(
            geom,
            precision,
            areaThreshold,
            zoom,
          );
        } else {
          throw new Error("UnknownType:" + geom.type);
        }

        try {
          if (feature.geometry) {
            const bbox = calculateBoundingBox(feature.geometry);
            const tiles = getTilesForZoomLevel(bbox, zoom);
            if (tiles.length === 0 || tiles.length > 16) {
              break;
            }
            zoomTileMap.set(zoom, [...(zoomTileMap.get(zoom) || []), ...tiles]);
          }
        } catch (error) {
          console.warn(zoom, countryName, adminName1, adminName2, error);
          break;
        }
      }

      // IndexedDBのgeojsonDataに保存
      const dataIdref = await db.geojsonData.add({
        geometry: feature.geometry,
        properties: feature.properties,
      });

      const adminLevel = adminName2 !== "" ? 2 : adminName1 !=="" ? 1 : 0;

      const metadataIdref = await db.geojsonMetadata.add({
        originalUrl: url,
        countryCode: countryName,
        countryName,
        adminName1,
        adminName2,
        adminLevel
      });

      const infoIdref = await db.geojsonInfo.add({
        precision,
        areaThreshold,
      });

      const items: GeoJSONIndex[] = zoomLevels
        .map((zoom) => {
          return zoomTileMap.get(zoom)?.map<GeoJSONIndex>((tile) => {
            return {
              dataIdref,
              metadataIdref,
              infoIdref,
              z2: zoom === 2 ? tile : "",
              z3: zoom === 3 ? tile : "",
              z4: zoom === 4 ? tile : "",
              z5: zoom === 5 ? tile : "",
              z6: zoom === 6 ? tile : "",
              z7: zoom === 7 ? tile : "",
              z8: zoom === 8 ? tile : "",
              z9: zoom === 9 ? tile : "",
            };
          });
        })
        .filter((items) => items !== undefined)
        .flat();

      if (items) {
        await db.geojsonIndex.bulkAdd(items);
      }
    }
  }

  // ここまで来たら成功
  return { failedUrls, parseErrorUrls };
}
