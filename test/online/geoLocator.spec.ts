import { expect } from "chai";
import { GeoLocator } from "../../src/services/GeoLocator";

describe("GeoLocator online", function () {
	this.timeout(15000);

	it("returns coordinates for a known address", async () => {
		const coords = await new GeoLocator().locate("6245 Agronomy Road V6T 1Z4");
		expect(coords).to.not.equal(undefined);
		expect(coords?.lat).to.be.a("number");
		expect(coords?.lon).to.be.a("number");
	});
});
