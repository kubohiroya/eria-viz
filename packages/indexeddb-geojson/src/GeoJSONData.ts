export interface GeoJSONData {
  id?: number; // auto-increment用
  geometry: any; // 実際のGeoJSONオブジェクトのfeatureのgeometryを格納
  properties: any; // 実際のGeoJSONオブジェクトのfeatureのpropertiesを格納
}
