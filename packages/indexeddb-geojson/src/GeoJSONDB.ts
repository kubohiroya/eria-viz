import Dexie, {Table} from "dexie";
import {GeoJSONData} from "./GeoJSONData";
import {GeoJSONIndex} from "./GeoJSONIndex";
import { GeoJSONMetadata } from "./GeoJSONMetadata";
import { GeoJSONInfo } from "./GeoJSONInfo";

export class GeoJSONDB extends Dexie {
  public geojsonData!: Table<GeoJSONData, number>;
  public geojsonMetadata!: Table<GeoJSONMetadata, number>;
  public geojsonInfo!: Table<GeoJSONInfo, number>;
  public geojsonIndex!: Table<GeoJSONIndex, number>;

  constructor(databaseName: string) {
    super(databaseName);
    this.version(1).stores({
      geojsonData: '++id',
      geojsonMetadata: '++id,sourceName,originalUrl,countryCode,countryName,adminName1,adminName2,adminLevel,[countryName+adminLevel]',
      geojsonInfo: '++id,precision,areaThreshold',
      geojsonIndex: '++id,dataIdref,metadataIdref,infoIdref,z2,z3,z4,z5,z6,z7,z8,z9',
    });
  }
}
