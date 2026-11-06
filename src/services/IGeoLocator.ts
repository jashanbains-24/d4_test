export type GeoCoordinates = {
	lat: number;
	lon: number;
};

export interface IGeoLocator {
	locate(address: string): Promise<GeoCoordinates | undefined>;
}
