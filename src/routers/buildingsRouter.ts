import { Router } from "express";
import { getBuildings, getBuildingById, putBuilding, deleteBuilding } from "../controllers/buildingController";

const buildingsRouter = Router();

buildingsRouter.get("/api/v2/buildings", getBuildings);
buildingsRouter.get("/api/v2/buildings/:buildingId", getBuildingById);
buildingsRouter.put("/api/v2/buildings/:buildingId", putBuilding);
buildingsRouter.delete("/api/v2/buildings/:buildingId", deleteBuilding);

export default buildingsRouter;
