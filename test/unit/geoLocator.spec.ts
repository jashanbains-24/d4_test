import fs from "fs/promises";
import path from "path";
import { expect } from "chai";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { createApp } from "../../src/App";
import { createReusableServer } from "../TestServer";
import { FakeGeoLocator } from "../FakeGeoLocator";
import { GeoCoordinates } from "../../src/services/IGeoLocator";

const { OK, ACCEPTED, NOT_FOUND } = StatusCodes;
const datadir = "./data" as const;
const DMP_ADDRESS = "6245 Agronomy Road V6T 1Z4";
const HERE: GeoCoordinates = { lat: 49.1, lon: -123.1 };

async function sleep(ms: number): Promise<void> {
	await new Promise((r) => setTimeout(r, ms));
}

async function waitForDatasetProcessing(app: any, url: string) {
	let status = await request(app).get(url);
	while (status.body.status === "processing") {
		await sleep(500);
		status = await request(app).get(url);
	}
	return status;
}

describe("Geolocation behaviours (D3 2B)", function () {
	this.timeout(60000);
	const testServer = createReusableServer();
	const app = testServer.server;

	async function uploadCampus(locate: (address: string) => GeoCoordinates | undefined): Promise<void> {
		testServer.setHandler(await createApp({ datadir, geolocator: new FakeGeoLocator(locate) }));
		const datasetBuffer = await fs.readFile(path.resolve(__dirname, "..", "test_data", "campus.zip"));
		const post = await request(app)
			.post("/api/v2/datasets")
			.field("kind", "facilities")
			.attach("archive", datasetBuffer, "campus.zip");
		expect(post).to.have.property("status", ACCEPTED);
		await waitForDatasetProcessing(app, "/api/v2/datasets/0");
	}

	afterEach(async () => {
		await fs.rm(datadir, { recursive: true, force: true });
	});
	after(async () => {
		await testServer.close();
	});

	it("skips a building and its rooms when geolocation fails", async () => {
		await uploadCampus((address) => (address === DMP_ADDRESS ? undefined : HERE));

		const dmp = await request(app).get("/api/v2/buildings/DMP");
		expect(dmp).to.have.property("status", NOT_FOUND);
		const rooms = await request(app).get("/api/v2/buildings/DMP/rooms");
		expect(rooms).to.have.property("status", NOT_FOUND);

		const acu = await request(app).get("/api/v2/buildings/ACU");
		expect(acu).to.have.property("status", OK);
	});

	it("stores the latitude and longitude the locator returned", async () => {
		await uploadCampus(() => HERE);

		const dmp = await request(app).get("/api/v2/buildings/DMP");
		expect(dmp).to.have.property("status", OK);
		expect(dmp.body).to.include({ lat: HERE.lat, lon: HERE.lon });
	});

	it("still loads the other buildings when one lookup fails", async () => {
		await uploadCampus((address) => (address === DMP_ADDRESS ? undefined : HERE));

		const status = await request(app).get("/api/v2/datasets/0");
		expect(status.body).to.have.property("status", "completed");

		const dmp = await request(app).get("/api/v2/buildings/DMP");
		expect(dmp).to.have.property("status", NOT_FOUND);

		const acu = await request(app).get("/api/v2/buildings/ACU");
		expect(acu).to.have.property("status", OK);
		expect(acu.body).to.include({ lat: HERE.lat, lon: HERE.lon });
	});
});
