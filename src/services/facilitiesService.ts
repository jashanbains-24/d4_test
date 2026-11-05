import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { Building, BuildingJSONFull, BuildingJSONLinks } from "./building";
import { Room, RoomJSONFull, RoomJSONLinks } from "./room";
import { validateGetParams } from "../validation/coursesValidation";

const { OK, CREATED, NO_CONTENT, NOT_FOUND, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = StatusCodes;

export type FacilitiesData = {
	buildings: Building[];
};

export class FacilitiesService {
	public data: FacilitiesData;
	private datadir: string;

	public constructor(datadir: string) {
		this.datadir = datadir;
		this.data = {
			buildings: [],
		};
	}

	public async readBuildings(): Promise<void> {
		try {
			const filepath = path.join(this.datadir, "buildings.json");
			const raw = await fs.readFile(filepath, "utf-8");
			const parsed = JSON.parse(raw);
			this.data.buildings = parsed.map((b: any) => {
				const bld = new Building(b.id, b.name, b.address, b.lat, b.lon, b.campus);
				if (b.rooms && Array.isArray(b.rooms)) {
					bld.rooms = b.rooms.map(
						(r: any) => new Room(r.id, r.building, r.number, r.type, r.furniture, r.href, r.seats, bld)
					);
				}
				return bld;
			});
		} catch (e: any) {
			if (e.code === "ENOENT") {
				this.data.buildings = [];
			} else {
				throw e;
			}
		}
	}

	public async writeBuildings(): Promise<void> {
		const filepath = path.join(this.datadir, "buildings.json");
		await fs.mkdir(this.datadir, { recursive: true });
		const serialized = this.data.buildings.map((b) => b.getJSONFull());
		await fs.writeFile(filepath, JSON.stringify(serialized, null, 2), "utf-8");
	}

	public async getBuildings(
		limitQuery: any,
		offsetQuery: any
	): Promise<{
		status: number;
		body: { total: number; limit: number; offset: number; items: BuildingJSONLinks[] } | any;
	}> {
		let limit = 100;
		let offset = 0;
		if (limitQuery !== undefined) limit = Number(limitQuery);
		if (offsetQuery !== undefined) offset = Number(offsetQuery);

		const valid = validateGetParams(limit, offset);
		if (!valid.valid) {
			return {
				status: 400,
				body: {
					error: "Invalid request parameters",
					params: valid.fields,
				},
			};
		}

		await this.readBuildings();
		const total = this.data.buildings.length;
		const sliced = this.data.buildings.slice(offset, offset + limit);
		const items = sliced.map((b) => b.getJSONLinks());
		return {
			status: OK,
			body: { total, limit, offset, items },
		};
	}

	public async getBuildingById(
		buildingId: string
	): Promise<{ status: number; body: BuildingJSONLinks | { error: string; message: string } }> {
		await this.readBuildings();
		const building = this.data.buildings.find((b) => b.id === buildingId);
		if (!building) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no building with id '${buildingId}'` },
			};
		}
		return { status: OK, body: building.getJSONLinks() };
	}

	public async setBuilding(
		buildingId: string,
		name: any,
		address: any,
		lat: any,
		lon: any,
		campus: any
	): Promise<{ status: number; body: BuildingJSONLinks | any }> {
		const fields: Record<string, string> = {};
		if (name === undefined) fields.name = "required but missing";
		else if (typeof name !== "string") fields.name = "expected a string";

		if (address === undefined) fields.address = "required but missing";
		else if (typeof address !== "string") fields.address = "expected a string";

		if (lat === undefined) fields.lat = "required but missing";
		else if (typeof lat !== "number") fields.lat = "expected a number";

		if (lon === undefined) fields.lon = "required but missing";
		else if (typeof lon !== "number") fields.lon = "expected a number";

		if (campus !== undefined && typeof campus !== "string") fields.campus = "expected a string";

		if (Object.keys(fields).length > 0) {
			return { status: UNPROCESSABLE_ENTITY, body: { error: "Validation failed", fields } };
		}

		await this.readBuildings();
		const existingIndex = this.data.buildings.findIndex((b) => b.id === buildingId);
		let status = CREATED;
		let finalCampus = campus;

		if (existingIndex !== -1) {
			status = NO_CONTENT;
			if (campus === undefined) {
				finalCampus = this.data.buildings[existingIndex].campus;
			}
			this.data.buildings.splice(existingIndex, 1);
		}

		const building = new Building(buildingId, name, address, lat, lon, finalCampus);
		this.data.buildings.push(building);
		await this.writeBuildings();

		if (status === NO_CONTENT) {
			return { status: NO_CONTENT, body: null };
		}
		return { status: CREATED, body: building.getJSONLinks() };
	}

	public async deleteBuilding(buildingId: string): Promise<{
		status: number;
		body: { id: string; name: string; address: string; lat: number; lon: number; rooms: number } | any;
	}> {
		await this.readBuildings();
		const idx = this.data.buildings.findIndex((b) => b.id === buildingId);
		if (idx === -1) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no building with id '${buildingId}'` },
			};
		}
		const deleted = this.data.buildings.splice(idx, 1)[0];
		await this.writeBuildings();
		return {
			status: OK,
			body: {
				id: deleted.id,
				name: deleted.name,
				address: deleted.address,
				lat: deleted.lat,
				lon: deleted.lon,
				rooms: deleted.rooms.length,
			},
		};
	}

	public async getRooms(
		buildingId: string,
		limitQuery: any,
		offsetQuery: any
	): Promise<{ status: number; body: { total: number; limit: number; offset: number; items: RoomJSONLinks[] } | any }> {
		await this.readBuildings();
		const building = this.data.buildings.find((b) => b.id === buildingId);
		if (!building) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no building with id '${buildingId}'` },
			};
		}

		let limit = 100;
		let offset = 0;
		if (limitQuery !== undefined) limit = Number(limitQuery);
		if (offsetQuery !== undefined) offset = Number(offsetQuery);

		const valid = validateGetParams(limit, offset);
		if (!valid.valid) {
			return {
				status: 400,
				body: {
					error: "Invalid request parameters",
					params: valid.fields,
				},
			};
		}

		const total = building.rooms.length;
		const sliced = building.rooms.slice(offset, offset + limit);
		const items = sliced.map((r) => r.getJSONLinks());
		return {
			status: OK,
			body: { total, limit, offset, items },
		};
	}

	public async getRoomById(
		buildingId: string,
		roomId: string
	): Promise<{ status: number; body: RoomJSONLinks | { error: string; message: string } }> {
		await this.readBuildings();
		const building = this.data.buildings.find((b) => b.id === buildingId);
		if (!building) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no building with id '${buildingId}'` },
			};
		}
		const room = building.rooms.find((r) => r.id === roomId);
		if (!room) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no room with id '${roomId}'` },
			};
		}
		return { status: OK, body: room.getJSONLinks() };
	}

	public async setRoom(
		buildingId: string,
		roomId: string,
		body: any
	): Promise<{ status: number; body: RoomJSONLinks | any }> {
		const fields: Record<string, string> = {};
		if (body.building === undefined) fields.building = "required but missing";
		else if (typeof body.building !== "string") fields.building = "expected a string";
		else if (body.building !== buildingId) fields.building = "must match parent building in path";

		if (body.number === undefined) fields.number = "required but missing";
		else if (typeof body.number !== "string") fields.number = "expected a string";

		if (body.type === undefined) fields.type = "required but missing";
		else if (typeof body.type !== "string") fields.type = "expected a string";

		if (body.furniture === undefined) fields.furniture = "required but missing";
		else if (typeof body.furniture !== "string") fields.furniture = "expected a string";

		if (body.href === undefined) fields.href = "required but missing";
		else if (typeof body.href !== "string") fields.href = "expected a string";

		if (body.seats === undefined) fields.seats = "required but missing";
		else if (typeof body.seats !== "number" || body.seats < 0 || !Number.isInteger(body.seats)) {
			fields.seats = "expected a number >= 0";
		}

		if (Object.keys(fields).length > 0) {
			return { status: UNPROCESSABLE_ENTITY, body: { error: "Validation failed", fields } };
		}

		await this.readBuildings();
		const building = this.data.buildings.find((b) => b.id === buildingId);
		if (!building) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no building with id '${buildingId}'` },
			};
		}

		const roomIdx = building.rooms.findIndex((r) => r.id === roomId);
		let status = CREATED;
		if (roomIdx !== -1) {
			status = NO_CONTENT;
			building.rooms.splice(roomIdx, 1);
		}

		const newRoom = new Room(
			roomId,
			buildingId,
			body.number,
			body.type,
			body.furniture,
			body.href,
			body.seats,
			building
		);
		building.rooms.push(newRoom);
		await this.writeBuildings();

		if (status === NO_CONTENT) {
			return { status: NO_CONTENT, body: null };
		}
		return { status: CREATED, body: newRoom.getJSONLinks() };
	}

	public async deleteRoom(
		buildingId: string,
		roomId: string
	): Promise<{ status: number; body: RoomJSONFull | { error: string; message: string } }> {
		await this.readBuildings();
		const building = this.data.buildings.find((b) => b.id === buildingId);
		if (!building) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no building with id '${buildingId}'` },
			};
		}
		const roomIdx = building.rooms.findIndex((r) => r.id === roomId);
		if (roomIdx === -1) {
			return {
				status: NOT_FOUND,
				body: { error: "Not found", message: `no room with id '${roomId}'` },
			};
		}
		const deletedRoom = building.rooms.splice(roomIdx, 1)[0];
		await this.writeBuildings();
		return { status: OK, body: deletedRoom.getJSONFull() };
	}
}
