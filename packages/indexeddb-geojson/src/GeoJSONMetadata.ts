export type GeoJSONMetadata = {
    id?: number; // auto-increment用
    sourceName: string; // データソース名
    originalUrl: string; // GeoJSONデータのURL
    countryCode: string;
    countryName: string;
    adminName1: string;
    adminName2: string;
    adminLevel: number;
}