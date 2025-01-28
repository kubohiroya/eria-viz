import * as React from "react";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { lonLatToTileXY } from "@eria-viz/map-utils";
import {GeoJSONDB, GeoJSONIndex, getGeoJSONDB } from "@eria-viz/indexeddb-geojson";

type GeoDBMapViewerProps = {
  databaseName: string;
  style: React.CSSProperties
};

export const GeoDBMapViewer = memo((props: GeoDBMapViewerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapObj, setMapObj] = useState<MapLibreMap | null>(null);

  useLayoutEffect(() => {
    // MapLibreの初期化
    if (mapContainer.current && !mapObj) {
      const map = new MapLibreMap({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [139.767125, 35.681236], // 東京駅付近
        zoom: 4,
      });

      setMapObj(map);

      map.on("load", () => {
        // GeoJSONレイヤーを追加する(初期空データ)
        if (!map.getSource("my-geojson")) {
          map.addSource("my-geojson", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });
          map.addLayer({
            id: "my-geojson-fill-layer",
            type: "fill",
            source: "my-geojson",
            paint: {
              "fill-color": "#880000",
              "fill-opacity": 0.1,
            },
          });
          map.addLayer({
            id: "my-geojson-stroke-layer",
            type: "line",
            source: "my-geojson",
            paint: {
              "line-color": "#ff0000",
              "line-opacity": 0.9,
            },
          });
        }

        // 初回データロード
        updateGeoJSONData(map);
      });

      // mapの移動終了(zoom, panなど)ごとにGeoJSONを更新
      map.on("moveend", () => {
        updateGeoJSONData(map);
      });
    }
  }, [mapContainer, mapObj]);

  /**
   * 現在のマップのズーム、表示領域から該当タイル文字列を計算 → IndexedDBで検索 → GeoJSON表示
   */
  const updateGeoJSONData = useCallback(async (map: MapLibreMap) => {
    // ズームレベル
    const zoom = Math.floor(map.getZoom());
    const bounds = map.getBounds(); // { _ne: { lng, lat }, _sw: { lng, lat } }
    const geoDB = getGeoJSONDB(props.databaseName);
    const mergedFC = await queryGeoJson(geoDB, zoom, bounds);

    // MapLibreのsourceを更新
    const source = map.getSource("my-geojson") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(mergedFC as any);
    }
  }, [props.databaseName]);

  return (
    <div
      ref={mapContainer}
      style={props.style}
    />
  );
});

async function queryGeoJson(
  geoDB: GeoJSONDB,
  zoom: number,
  bounds: any,
): Promise<any> {
  // 表示領域
  const minLng = bounds.getWest();
  const maxLng = bounds.getEast();
  const minLat = bounds.getSouth();
  const maxLat = bounds.getNorth();

  // 現在のズームに対応するタイルIDを取得
  const tileIds: Map<number, string[]> = new Map();

  for (let z = Math.max(2, zoom - 2); z <= Math.min(zoom + 2, 9); z++) {
    const { x: minX, y: minY } = lonLatToTileXY(minLng, maxLat, z);
    const { x: maxX, y: maxY } = lonLatToTileXY(maxLng, minLat, z);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tileIds.set(z, [...(tileIds.get(z) || []), `${z}/${x}/${y}`]);
      }
    }
  }

  // Dexieで「該当tileIdsのいずれかを持つレコード」を検索する
  const indexFieldName = (zoom: number) =>
    2 <= zoom && zoom <= 9 ? `z${zoom}` : `z9`;

  const zoomLevels = [];
  for (let z = zoom - 1; z <= 9; z++) {
    zoomLevels.push(z);
  }

  const geojsonIndices: GeoJSONIndex[][] = (
    await Promise.all(
      zoomLevels.map((z) => {
        // たとえば、zoomが4なら z4 フィールドが tileIds のいずれかを含むものを検索
        const indexFieldNameOfZoomLevel = indexFieldName(z);
        const tileIdsOfZoomLevel = tileIds.get(z);
        return tileIdsOfZoomLevel
          ? geoDB.geojsonIndex
              .where(indexFieldNameOfZoomLevel)
              .anyOf(tileIdsOfZoomLevel)
              .toArray()
          : undefined;
      }),
    )
  ).filter((item) => item !== undefined) as GeoJSONIndex[][];

  // console.log(geojsonIndices);

  const mergedFeatures: Map<number, GeoJSONIndex & { feature?: any }> =
    new Map();
  geojsonIndices.flat().map((geojsonIndexItem) => {
    mergedFeatures.set(geojsonIndexItem.dataIdref, geojsonIndexItem);
  });

  await Promise.all(
      (mergedFeatures.values() as any).map((geojsonIndexItem: any) => {
      return geoDB.geojsonData
        .get(geojsonIndexItem.ref)
        .then((geojsonDataItem) => {
          if (geojsonDataItem) {
            geojsonIndexItem.feature = geojsonDataItem;
          }
        });
    }),
  );

  // MapLibreのGeoJSONソースにセットするため、1つのFeatureCollectionにまとめる
  return {
    type: "FeatureCollection",
    features: (mergedFeatures
      .values() as any)
      .toArray()
      .map((geoJsonIndexItem: any) => ({
        type: "Feature",
        geometry: geoJsonIndexItem.feature.geometry,
      })),
  };
}

export default GeoDBMapViewer;
