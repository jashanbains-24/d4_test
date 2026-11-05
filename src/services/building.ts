import { Room, RoomJSONFull, RoomJSONLinks } from "./room";

const prefixBuildings = "/api/v2/buildings";

export type BuildingJSONLinks = {
	id: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	campus?: string;
	links: { self: string; rooms: string };
};

export type BuildingJSONFull = {
	id: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	campus?: string;
	rooms: RoomJSONFull[];
};

export type BuildingJSONForDelete = {
	id: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	campus?: string;
	rooms: number;
};

export class Building {
	constructor(
		public id: string,
		public name: string,
		public address: string,
		public lat: number,
		public lon: number,
		public campus?: string
	) {}

	public rooms: Room[] = [];

	public getJSONLinks(): BuildingJSONLinks {
		return {
			id: this.id,
			name: this.name,
			address: this.address,
			lat: this.lat,
			lon: this.lon,
			links: {
				self: `${prefixBuildings}/${this.id}`,
				rooms: `${prefixBuildings}/${this.id}/rooms`,
			},
			campus: this.campus !== undefined ? this.campus : undefined,
		};
	}

	public getJSONFull(): BuildingJSONFull {
		return {
			id: this.id,
			name: this.name,
			address: this.address,
			lat: this.lat,
			lon: this.lon,
			rooms: this.rooms.map((room) => room.getJSONFull()),
			campus: this.campus !== undefined ? this.campus : undefined,
		};
	}

	public getJSONForDelete(): BuildingJSONForDelete {
		return {
			id: this.id,
			name: this.name,
			address: this.address,
			lat: this.lat,
			lon: this.lon,
			rooms: this.rooms.length,
			campus: this.campus !== undefined ? this.campus : undefined,
		};
	}

	public static buildBuilding(data: Building): Building {
		const newBuilding = new Building(data.id, data.name, data.address, data.lat, data.lon, data.campus);
		newBuilding.rooms = data.rooms.map((room: Room) => Room.buildRoom(room, newBuilding));
		return newBuilding;
	}

	public getRooms(): Room[] {
		return this.rooms;
	}

	public getRoomById(id: string): Room | undefined {
		return this.rooms.find((room) => room.id === id);
	}

	public setRoom(
		id: string,
		number: string,
		type: string,
		furniture: string,
		href: string,
		seats: number
	): { replace: boolean; body: RoomJSONLinks } {
		let exist = false;
		if (this.getRoomById(id)) {
			exist = true;
			this.deleteRoom(id);
		}
		const room = new Room(id, this.id, number, type, furniture, href, seats, this);
		this.rooms.push(room);
		return {
			replace: exist,
			body: room.getJSONLinks(),
		};
	}

	public deleteRoom(id: string): { success: boolean; body: RoomJSONFull | {} } {
		const index = this.rooms.findIndex((room) => room.id === id);
		if (index >= 0) {
			const body = this.rooms[index].getJSONFull();
			this.rooms.splice(index, 1);
			return {
				success: true,
				body: body,
			};
		} else {
			return {
				success: false,
				body: {},
			};
		}
	}
}
