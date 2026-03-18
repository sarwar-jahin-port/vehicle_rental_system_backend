import { Request, Response } from "express";
import { authService } from "./auth.services";

const createUser = async (req: Request, res: Response) => {
    try {
        const user = await authService.createUserService(req.body);
        return res.status(201).json({ message: "User created successfully", user });
    } catch (error: any) {
        return res.status(400).json({ message: error?.message });
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginService(req.body);
        return res.status(200).json({ message: "Login successful", ...result });
    } catch (error: any) {
        return res.status(400).json({ message: error?.message });
    }
}

export const authController = {
    createUser,
    login
}