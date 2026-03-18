import { Request, Response } from "express";
import { vehicleService } from "./vehicle.services";

const createVehicle = async (req: Request, res: Response) => {
    try {
        const vehicle = await vehicleService.createVehicleService(req.body);
        return res.status(201).json({ success: true, message: "Vehicle created successfully", vehicle });
    } catch (error: any) {
        const status = error.code === "23505" ? 409 : 400;
        return res.status(status).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await vehicleService.getAllVehiclesService();
        return res.status(200).json({ success: true, vehicles });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const getVehicleById = async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId);

    if (!vehicleId || Number.isNaN(vehicleId)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
    }

    try {
        const vehicle = await vehicleService.getVehicleByIdService(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        return res.status(200).json({ success: true, vehicle });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const updateVehicleById = async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId);

    if (!vehicleId || Number.isNaN(vehicleId)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
    }

    try {
        const vehicle = await vehicleService.updateVehicleByIdService(vehicleId, req.body);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        return res.status(200).json({ success: true, message: "Vehicle updated successfully", vehicle });
    } catch (error: any) {
        const status = error.message === "No valid fields provided for update" ? 400 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const deleteVehicleById = async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId);

    if (!vehicleId || Number.isNaN(vehicleId)) {
        return res.status(400).json({ success: false, message: "Invalid vehicle ID" });
    }

    try {
        const vehicle = await vehicleService.deleteVehicleByIdService(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        return res.status(200).json({ success: true, message: "Vehicle deleted successfully", vehicle });
    } catch (error: any) {
        const status = error.message === "Cannot delete vehicle with active bookings" ? 400 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

export const vehicleController = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicleById,
    deleteVehicleById
};
