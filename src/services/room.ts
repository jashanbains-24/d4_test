import { FilterableRecord } from "../App";
import { Building } from "./building";

const prefixBuildings = "/api/v2/buildings";

export type RoomJSONLinks = {
	id: string;
	building: string;
	number: string;
	type: string;
	furniture: string;
	href: string;
	seats: number;
	links: { self: string; building: string };
};

export type RoomJSONFull = {
	id: string;
	building: string;
	number: string;
	type: string;
	furniture: string;
	href: string;
	seats: number;
};

export class Room implements FilterableRecord {
	constructor(
		public id: string,
		public building: string,
		public number: string,
		public type: string,
		public furniture: string,
		public href: string,
		public seats: number,
		public building_obj: Building
	) {}

	public isSame(other: FilterableRecord): boolean {
		if (!(other instanceof Room)) {
			return false;
		}
		return this.id === other.id && this.building === other.building;
	}

	public getJSONLinks(): RoomJSONLinks {
		return {
			id: this.id,
			building: this.building,
			number: this.number,
			type: this.type,
			furniture: this.furniture,
			href: this.href,
			seats: this.seats,
			links: {
				self: `${prefixBuildings}/${this.building}/rooms/${this.id}`,
				building: `${prefixBuildings}/${this.building}`,
			},
		};
	}

	public getJSONFull(): RoomJSONFull {
		return {
			id: this.id,
			building: this.building,
			number: this.number,
			type: this.type,
			furniture: this.furniture,
			href: this.href,
			seats: this.seats,
		};
	}

	public static buildRoom(data: Room, building: Building): Room {
		const { id, number, type, furniture, href, seats } = data;
		return new Room(id, data.building, number, type, furniture, href, seats, building);
	}

	public getValue(key: string): any {
		if (["name", "address", "lat", "lon", "campus"].includes(key)) return (this.building_obj.getJSONFull() as any)[key];
		else return (this.getJSONFull() as any)[key];
	}
}
