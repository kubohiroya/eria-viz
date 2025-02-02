export enum SourceHostNames {
    GADM = "GADM",
}

export type SourceHostMetadata = {
    sourceHostPageUrl: string;
    sourceHostName: string;
    sourceHostDescription: string;
    licensePageUrl: string;
    countryIndexPageUrl: string;
};

export const SourceHosts: {[key: string]: SourceHostMetadata}  = {
    GADM: {
        sourceHostName: SourceHostNames.GADM,
        sourceHostPageUrl: "https://gadm.org",
        sourceHostDescription: `GADM is a spatial database of the location of the world's administrative areas (or adminstrative boundaries) for use in GIS and similar software. Administrative areas in this database are countries and lower level subdivisions such as provinces, departments, bibhag, bundeslander, daerah istimewa, fivondronana, krong, landsvæðun, opština, sous-préfectures, counties, and thana. GADM describes where these administrative areas are (the "spatial features"), and for each area it provides some attributes, such as the name and variant names.`,
        licensePageUrl: "https://gadm.org/license.html",
        countryIndexPageUrl: "https://gadm.org/download_country.html",
    }
}

export const SourceHostNameArray = [SourceHostNames.GADM];

