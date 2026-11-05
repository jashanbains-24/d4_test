import { Router } from "express";
import { getRooms, getRoomById, putRoom, deleteRoom } from "../controllers/roomController";

const roomsRouter = Router();

roomsRouter.get("/api/v2/buildings/:buildingId/rooms", getRooms);
roomsRouter.get("/api/v2/buildings/:buildingId/rooms/:roomId", getRoomById);
roomsRouter.put("/api/v2/buildings/:buildingId/rooms/:roomId", putRoom);
roomsRouter.delete("/api/v2/buildings/:buildingId/rooms/:roomId", deleteRoom);

export default roomsRouter;
