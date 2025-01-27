export function createGADMCountryUrl(countryCode: string) {
    return `https://gadm.org/maps/${countryCode}.html`;
}
export function createGADMRegionUrl(countryCode: string, level: number) {
    return `https://gadm.org/maps/${countryCode}_${level}.html`;
}
