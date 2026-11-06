import { StatusCodes } from "http-status-codes";
import { GeoCoordinates, IGeoLocator } from "./IGeoLocator";

const GEO_SERVICE_URL = "http://cs310.students.cs.ubc.ca:11316/api/v1/geolocation/";
const GEO_SERVICE_TIMEOUT_MS = 5000;

type CoordResponseFormat = {
	lat?: number;
	lon?: number;
	error?: string;
};

function isCoordinate(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

export class GeoLocator implements IGeoLocator {
	public async locate(address: string): Promise<GeoCoordinates | undefined> {
		const url = GEO_SERVICE_URL + encodeURIComponent(address);
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(GEO_SERVICE_TIMEOUT_MS) });
			const body = (await res.json()) as CoordResponseFormat;
			if (res.status !== StatusCodes.OK || body.error || !isCoordinate(body.lat) || !isCoordinate(body.lon)) {
				return undefined;
			}
			return { lat: body.lat, lon: body.lon };
		} catch {
			return undefined;
		}
	}
}
