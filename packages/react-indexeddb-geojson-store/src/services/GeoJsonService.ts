import { GeoJSONDB, getGeoJSONDB } from "@eria-viz/indexeddb-geojson";
import { DatabaseCatalog } from "@eria-viz/indexeddb-catalog";
import { CountryMetadata } from "../types/CountryMetadata";

export enum CheckboxState {
  Unchecked,
  Checked,
  Indeterminate,
}

export type HeaderCheckboxState = {
  columnHeader: CheckboxState[];
  rowHeader: CheckboxState[];
  northWestHeader: CheckboxState;
  checkedCount: number;
};

export class GeoJsonService {
  static _rootCatalog: DatabaseCatalog;
  rootCatalog: DatabaseCatalog;
  catalog: DatabaseCatalog;
  geojsonDB: GeoJSONDB;

  static createCountryUrl(countryCode: string) {
    return `https://gadm.org/maps/${countryCode}.html`;
  }

  static createAdminUrl(countryCode: string, level: number) {
    return `https://gadm.org/maps/${countryCode}_${level}.html`;
  }

  static createGeoJsonDownloadURL(countryCode: string, level: number) {
    return `https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_${countryCode}_${level}.json.zip`;
  }

  static async getRootCatalog(): Promise<DatabaseCatalog> {
    if (GeoJsonService._rootCatalog == null) {
      GeoJsonService._rootCatalog = await DatabaseCatalog.initialize(
        "GJDatabaseCatalog",
        "",
        false,
      );
    }
    return GeoJsonService._rootCatalog;
  }

  static async createInstance(databaseName: string): Promise<GeoJsonService> {
    const rootCatalog = await GeoJsonService.getRootCatalog();
    const catalog =
      (await rootCatalog.get(databaseName)) ||
      (await rootCatalog.create(databaseName));
    const geojsonDB = getGeoJSONDB(catalog.getIndexedDBName());
    // const geoJsonMetadataArray = await geojsonDB.geojsonMetadata.toArray();
    return new GeoJsonService(rootCatalog, catalog, geojsonDB);
  }

  static async listDatabaseNames(): Promise<string[]> {
    const rootCatalog = await GeoJsonService.getRootCatalog();
    return (await rootCatalog.listNames()).sort();
  }

  static async getDefaultDatabaseName(): Promise<string> {
    const rootCatalog = await GeoJsonService.getRootCatalog();
    return rootCatalog.properties.defaultDatabaseName;
  }

  static countMaxAdminLevel(countryMetadataArray: CountryMetadata[]): number {
    return countryMetadataArray.reduce(
      (countryMetadata1: CountryMetadata, countryMetadata2: CountryMetadata) =>
        countryMetadata1.numAdminLevels > countryMetadata2.numAdminLevels
          ? countryMetadata1
          : countryMetadata2,
    ).numAdminLevels;
  }

  static createHeaderCheckboxState(
    checkboxMatrix: boolean[][],
    numAdminLevels: number,
    countryMetadataList: CountryMetadata[],
  ): HeaderCheckboxState {
    const result: HeaderCheckboxState = {
      rowHeader: new Array<CheckboxState>(countryMetadataList.length).fill(
        CheckboxState.Unchecked,
      ),
      columnHeader: new Array<CheckboxState>(numAdminLevels).fill(
        CheckboxState.Unchecked,
      ),
      northWestHeader: CheckboxState.Unchecked,
      checkedCount: 0,
    };

    const numCheckboxesByColumn = new Array<number>(numAdminLevels).fill(0);
    const numSelectedCheckboxesByColumn = new Array<number>(
      numAdminLevels,
    ).fill(0);

    for (let rowIndex = 0; rowIndex < countryMetadataList.length; rowIndex++) {
      let numSelectedCheckboxesByRow = 0;
      for (
        let columnIndex = 0;
        countryMetadataList[rowIndex] &&
        columnIndex < countryMetadataList[rowIndex].numAdminLevels;
        columnIndex++
      ) {
        numCheckboxesByColumn[columnIndex]++;
        if (checkboxMatrix[rowIndex]?.[columnIndex]) {
          numSelectedCheckboxesByRow++;
          numSelectedCheckboxesByColumn[columnIndex]++;
          result.checkedCount++;
        }
      }
      if (
        countryMetadataList[rowIndex] &&
        numSelectedCheckboxesByRow ===
          countryMetadataList[rowIndex].numAdminLevels
      ) {
        result.rowHeader[rowIndex] = CheckboxState.Checked;
      } else if (numSelectedCheckboxesByRow === 0) {
        result.rowHeader[rowIndex] = CheckboxState.Unchecked;
      } else {
        result.rowHeader[rowIndex] = CheckboxState.Indeterminate;
      }
    }

    for (let columnIndex = 0; columnIndex < numAdminLevels; columnIndex++) {
      if (
        numSelectedCheckboxesByColumn[columnIndex] ===
        numCheckboxesByColumn[columnIndex]
      ) {
        result.columnHeader[columnIndex] = CheckboxState.Checked;
      } else if (numSelectedCheckboxesByColumn[columnIndex] === 0) {
        result.columnHeader[columnIndex] = CheckboxState.Unchecked;
      } else {
        result.columnHeader[columnIndex] = CheckboxState.Indeterminate;
      }
    }

    result.northWestHeader = result.columnHeader.every(
      (state) => state === CheckboxState.Checked,
    )
      ? CheckboxState.Checked
      : result.columnHeader.every((state) => state === CheckboxState.Unchecked)
        ? CheckboxState.Unchecked
        : CheckboxState.Indeterminate;
    return result;
  }

  constructor(
    rootCatalog: DatabaseCatalog,
    catalog: DatabaseCatalog,
    geojsonDB: GeoJSONDB,
  ) {
    this.rootCatalog = rootCatalog;
    this.catalog = catalog;
    this.geojsonDB = geojsonDB;
  }

  setDefaultDatabaseName(databaseName: string): void {
    this.rootCatalog.update({
      properties: { defaultDatabaseName: databaseName },
    });
  }

  /*
    public async createDownloadedMatrix():Promise<boolean[][]> {
        return await Promise.all(this.countryMetadataArray.map((countryMetadata: CountryMetadata) =>
            Promise.all(new Array<boolean>(countryMetadata.maxAdminLevel + 1).map(async(_: boolean, adminLevel: number) =>
                (await this.geojsonDB.geojsonIndex.where("[countryName+adminLevel]").equals([countryMetadata.countryName,adminLevel]).count()) > 0
            ))));
    }

    public async createSelectedUrlMatrix(selectCheckboxMatrix: boolean[][]):Promise<Array<Array<string|null>>> {
        return await Promise.all(this.countryMetadataArray.map((countryMetadata: CountryMetadata, countryIndex: number) =>
            Promise.all(new Array<boolean>(countryMetadata.maxAdminLevel + 1).map(async(_: boolean, adminLevel: number) => {
                if(selectCheckboxMatrix[countryIndex][adminLevel]) {
                    if (adminLevel === 0) {
                        return GeoJsonService.createCountryUrl(countryMetadata.countryCode);
                    } else {
                        return GeoJsonService.createAdminUrl(countryMetadata.countryCode, adminLevel);
                    }
                }else{
                    return null;
                }
            }))));
    }

    public async createDownloadStatusMatrix(selectCheckboxMatrix: boolean[][]):Promise<Array<Array<DownloadStatus|null>>> {
        return await Promise.all(this.countryMetadataArray.map((countryMetadata: CountryMetadata, countryIndex: number) =>
            Promise.all(new Array<boolean>(countryMetadata.maxAdminLevel + 1).map(async(_: boolean, adminLevel: number) => {
                if(selectCheckboxMatrix[countryIndex][adminLevel]) {
                    return DownloadStatus.Initialized;
                }else{
                    return null;
                }
            }))));
    }

    public async downloadGeoJSON(catalogUUID: string, checkboxMatrix: boolean[][]):Promise<void> {
        (async function () {
            //this.geoJsonDB = await DatabaseCatalog.initialize("GADM", "", false);
            //const catalogUUID = (await database.current.get(databaseName)).uuid;
            // FIXME
        })();
    }

    countryMetadataArray
.filter((item: CountryMetadata, rowIndex: number)=>{
    return checkboxMatrix[rowIndex].some((checked: boolean)=>checked);
})
.forEach((item: CountryMetadata, dataIndex: number) => {
    for(let level = 0; level <= item.maxAdminLevel; level++){
        if(checkboxMatrix[item.index][level]){
            const downloadUUID = await storeGeoJSON(
                catalogUUID,
                new Array<{ url: string; contents: any }>,
                precision: number,
                areaThreshold: number,
                createGADMRegionUrl(item.countryCode, level),
                `GADM_${item.countryCode}_${level}.zip`,
                (progress: number) => {
                    setDownloadProgress((prev) => {
                        return new Map(prev).set(`${dataIndex}_${level}`, progress);
                    });
                }
        );
        }
    }
    return checkboxMatrix[countryMetadata.index][];
});
})();
*/
}
