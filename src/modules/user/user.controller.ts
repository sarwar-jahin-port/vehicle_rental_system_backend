import { Request, Response } from "express";
import { userService } from "./user.services";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsersService();
        res.status(200).json({ success: true, users });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: error.message,
            details: error 
        });
    }
}

const getUserById = async (req: Request, res: Response) => {
    const requesterRole = req.user?.role;
    const requesterId = Number(req.user?.id);
    const userId = Number(req.params.userId);

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (requesterRole === "customer" && requesterId !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden: You can only access your own user information" });
    }

    try {
        const user = await userService.getUserByIdService(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: error.message,
            details: error 
        });
    }
}

const updateUserById = async (req: Request, res: Response) => {
    const requesterRole = String(req.user?.role || "");
    const requesterId = Number(req.user?.id);
    const userId = Number(req.params.userId);

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (requesterRole === "customer" && requesterId !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden: You can only update your own user information" });
    }

    try {
        const user = await userService.updateUserByIdService(userId, req.body, requesterRole);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User updated successfully", user });
    } catch (error: any) {
        const status = error.message === "No valid fields provided for update" ? 400 : 500;
        return res.status(status).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const deleteUserById = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    try {
        const user = await userService.deleteUserByIdService(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User deleted successfully", user });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

export const userController = {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
}