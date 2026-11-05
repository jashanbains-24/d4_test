import type { Request, Response } from "express";
import { Model } from "../App";
import { DataDirectory } from "../repositories/dataDirectory";

export async function getBuildings(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.getBuildings(req.query.limit, req.query.offset);
	res.status(output.status).json(output.body);
}

export async function getBuildingById(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.getBuildingById(req.params.buildingId);
	res.status(output.status).send(output.body);
}

export async function putBuilding(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.setBuilding(
		req.params.buildingId,
		req.body.name,
		req.body.address,
		req.body.lat,
		req.body.lon,
		req.body.campus
	);
	res.status(output.status).send(output.body);
}

export async function deleteBuilding(req: Request, res: Response): Promise<void> {
	const datadir = DataDirectory.getInstance().getDataDirectory();
	const model = new Model(datadir);
	const output = await model.deleteBuilding(req.params.buildingId);
	res.status(output.status).send(output.body);
}
