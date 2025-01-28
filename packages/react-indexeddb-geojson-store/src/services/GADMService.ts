import {GeoJSONDB, GeoJSONMetadata, getGeoJSONDB} from "@eria-viz/indexeddb-geojson";
import {DatabaseCatalog} from "@eria-viz/indexeddb-catalog";
import {groupBy} from "../utils/arrayUtils";
import {CountryMetadata} from "../types/CountryMetadata";
import {DownloadStatus} from "../types/DownloadStatus";

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

export class GADMService{

    static catalogRoot: DatabaseCatalog;

    geojsonDBCatalog: DatabaseCatalog;
    geojsonDB: GeoJSONDB;
    metadataArrayByCountryName: Map<string,GeoJSONMetadata[]>;
    countryMetadataArray: CountryMetadata[];
    maxAdminLevel: number;

    static createGADMCountryUrl(countryCode: string) {
        return `https://gadm.org/maps/${countryCode}.html`;
    }

    static createGADMRegionUrl(countryCode: string, level: number) {
        return `https://gadm.org/maps/${countryCode}_${level}.html`;
    }

    static createGADMGeoJsonDownloadURL(countryCode: string, level: number) {
        return `https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_${countryCode}_${level}.json.zip`;
    }

    static async getCatalogRoot(): Promise<DatabaseCatalog>{
        if(GADMService.catalogRoot == null){
            GADMService.catalogRoot = await DatabaseCatalog.initialize("GADMDatabaseCatalog", "", false);
        }
        return GADMService.catalogRoot;
    }

    static async listDatabaseNames():Promise<string[]> {
        return (await (await GADMService.getCatalogRoot()).listNames()).sort();
    }

    static async getDefaultDatabaseName():Promise<string> {
        return (await GADMService.getCatalogRoot()).properties.defaultDatabaseName;
    }

    static async setDefaultDatabaseName(databaseName: string):Promise<void> {
        (await GADMService.getCatalogRoot()).properties.defaultDatabaseName = databaseName;
    }

    static async createInstance(databaseName: string):Promise<GADMService> {
        const catalogRoot = await GADMService.getCatalogRoot();
        const catalog = await catalogRoot.get(databaseName) || await catalogRoot.create(databaseName);
        const geojsonDB = getGeoJSONDB(catalog.getIndexedDBName());
        const geoJsonMetadataArray = await geojsonDB.geojsonMetadata.toArray();
        const metadataArrayByCountryName = groupBy({source: geoJsonMetadataArray, key: "countryName"});
        const maxAdminLevel = catalogRoot.properties.maxAdminLevel;
        const countryMetadataArray: CountryMetadata[] = geoJsonMetadataArray.map((geoJsonMetadata: GeoJSONMetadata) => {
            return {
                countryName: geoJsonMetadata.countryName,
                countryCode: geoJsonMetadata.countryCode,
                maxAdminLevel
            };
        });
        return new GADMService(catalogRoot, geojsonDB, metadataArrayByCountryName, countryMetadataArray, maxAdminLevel);
    }

    static countMaxAdminLevel(countryMetadataArray: CountryMetadata[]):number {
        return countryMetadataArray.reduce((countryMetadata1: CountryMetadata, countryMetadata2: CountryMetadata) => countryMetadata1.maxAdminLevel > countryMetadata2.maxAdminLevel ? countryMetadata1 : countryMetadata2).maxAdminLevel;
    }

    static createHeaderCheckboxState(
        checkboxMatrix: boolean[][],
        maxAdminLevel: number,
        countryMetadataList: CountryMetadata[],
    ): HeaderCheckboxState {
        const result: HeaderCheckboxState = {
            rowHeader: new Array<CheckboxState>(countryMetadataList.length).fill(
                CheckboxState.Unchecked,
            ),
            columnHeader: new Array<CheckboxState>(maxAdminLevel + 1).fill(
                CheckboxState.Unchecked,
            ),
            northWestHeader: CheckboxState.Unchecked,
            checkedCount: 0
        };

        const numCheckboxesByColumn = new Array<number>(maxAdminLevel + 1).fill(0);
        const numSelectedCheckboxesByColumn = new Array<number>(
            maxAdminLevel + 1,
        ).fill(0);

        for (let rowIndex = 0; rowIndex <= countryMetadataList.length; rowIndex++) {
            let numSelectedCheckboxesByRow = 0;
            for (
                let columnIndex = 0;
                countryMetadataList[rowIndex] &&
                columnIndex <= countryMetadataList[rowIndex].maxAdminLevel;
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
                numSelectedCheckboxesByRow === countryMetadataList[rowIndex].maxAdminLevel + 1
            ) {
                result.rowHeader[rowIndex] = CheckboxState.Checked;
            } else if (numSelectedCheckboxesByRow === 0) {
                result.rowHeader[rowIndex] = CheckboxState.Unchecked;
            } else {
                result.rowHeader[rowIndex] = CheckboxState.Indeterminate;
            }
        }

        for (let columnIndex = 0; columnIndex <= maxAdminLevel; columnIndex++) {
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

    constructor(geojsonDBCatalog: DatabaseCatalog, geojsonDB: GeoJSONDB, metadataArrayByCountryName: Map<string,GeoJSONMetadata[]>, countryMetadataArray: CountryMetadata[], maxAdminLevel: number) {
        this.geojsonDBCatalog = geojsonDBCatalog;
        this.geojsonDB = geojsonDB;
        this.metadataArrayByCountryName = metadataArrayByCountryName;
        this.countryMetadataArray = countryMetadataArray;
        this.maxAdminLevel = maxAdminLevel;
    }

    async updateCountryMetadataArray(content: string):Promise<CountryMetadata[]> {
        const doc = new DOMParser().parseFromString(content, 'text/html');
        const select = doc.getElementById('countrySelect');
        if(select === null){
            throw new Error();
        }
        const countryMetadataArray: CountryMetadata[] = [];
        let index = 0;
        for(let i = 0; i < select.children.length; i++){
            const option = select.children.item(i);
            if(option === null){
                continue;
            }
            const value = option.getAttribute("value");
            if(value === null || !(value.includes("_"))) {
                continue;
            }
            const [countryCode, countryName, maxAdminLevel] = option.getAttribute("value")!.split('_');
            countryMetadataArray.push({
                countryName,
                countryCode,
                maxAdminLevel: parseInt(maxAdminLevel),
            });
        }
        this.countryMetadataArray = countryMetadataArray;
        return countryMetadataArray;
    }

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
                        return GADMService.createGADMCountryUrl(countryMetadata.countryCode);
                    } else {
                        return GADMService.createGADMRegionUrl(countryMetadata.countryCode, adminLevel);
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
    /*
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

