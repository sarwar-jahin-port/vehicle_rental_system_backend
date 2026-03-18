import jwt from "jsonwebtoken";
import { config } from "../config/env";

const auth = (...roles: string[]) => async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, config.jwtSecret as string) as jwt.JwtPayload;
        console.log("Decoded Token:", decodedToken);
        console.log("Required Roles:", roles);
        if (roles.length > 0 && (!decodedToken.role || !roles.includes(String(decodedToken.role)))) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = decodedToken;
        console.log("User attached to request:", req.user);
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(401).json({ message: "Invalid token" });
    }
}

export default auth;