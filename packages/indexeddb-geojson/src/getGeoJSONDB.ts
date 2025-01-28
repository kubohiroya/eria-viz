import {GeoJSONDB} from "./GeoJSONDB";

/**
 * シングルトンインスタンスを取得
 */
const instances: Map<string, GeoJSONDB> = new Map();
export function getGeoJSONDB(databaseName: string): GeoJSONDB {
    let instance = instances.get(databaseName);
    if (!instance) {
        instance = new GeoJSONDB(databaseName);
        instances.set(databaseName, instance);
        return instance;
    }
    return instance;
}