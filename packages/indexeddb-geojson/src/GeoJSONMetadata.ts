export type GeoJSONMetadata = {
    id?: number; // auto-increment用
    originalUrl: string; // GeoJSONデータのURL
    countryCode: string;
    countryName: string;
    adminName1: string;
    adminName2: string;
    adminLevel: number;
}