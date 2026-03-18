import { Router } from "express";
import auth from "../../middleware/auth";
import { vehicleController } from "./vehicle.controller";

const vehicleRouter = Router();

vehicleRouter.post("/", auth("admin"), vehicleController.createVehicle);
vehicleRouter.get("/", vehicleController.getAllVehicles);
vehicleRouter.get("/:vehicleId", vehicleController.getVehicleById);
vehicleRouter.put("/:vehicleId", auth("admin"), vehicleController.updateVehicleById);
vehicleRouter.delete("/:vehicleId", auth("admin"), vehicleController.deleteVehicleById);

export default vehicleRouter;
