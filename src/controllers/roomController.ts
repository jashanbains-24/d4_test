import type { Request, Response } from "express";
import { Model } from "../App";
import { DataDirectory } from "../repositories/dataDirectory";

export async function getRooms(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.getRooms(req.params.buildingId, req.query.limit, req.query.offset);
	res.status(output.status).send(output.body);
}

export async function getRoomById(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.getRoomById(req.params.buildingId, req.params.roomId);
	res.status(output.status).send(output.body);
}

export async function putRoom(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.setRoom(req.params.buildingId, req.params.roomId, req.body);
	res.status(output.status).send(output.body);
}

export async function deleteRoom(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.deleteRoom(req.params.buildingId, req.params.roomId);
	res.status(output.status).send(output.body);
}
