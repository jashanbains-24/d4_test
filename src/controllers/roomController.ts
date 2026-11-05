import type { Request, Response } from "express";
import { FacilitiesService } from "../services/facilitiesService";
import { DataDirectory } from "../repositories/dataDirectory";

export async function getRooms(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const service = new FacilitiesService(datadir);
	const output = await service.getRooms(req.params.buildingId, req.query.limit, req.query.offset);
	res.status(output.status).send(output.body);
}

export async function getRoomById(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const service = new FacilitiesService(datadir);
	const output = await service.getRoomById(req.params.buildingId, req.params.roomId);
	res.status(output.status).send(output.body);
}

export async function putRoom(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const service = new FacilitiesService(datadir);
	const output = await service.setRoom(req.params.buildingId, req.params.roomId, req.body);
	res.status(output.status).send(output.body);
}

export async function deleteRoom(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const service = new FacilitiesService(datadir);
	const output = await service.deleteRoom(req.params.buildingId, req.params.roomId);
	res.status(output.status).send(output.body);
}
