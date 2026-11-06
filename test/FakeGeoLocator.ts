import { IGeoLocator } from "../src/services/IGeoLocator";
import { GeoCoordinates } from "../src/services/IGeoLocator";

export class FakeGeoLocator implements IGeoLocator {
	public constructor(private readonly handler: (address: string) => GeoCoordinates | undefined) {}

	public async locate(address: string): Promise<GeoCoordinates | undefined> {
		return this.handler(address);
	}
}
