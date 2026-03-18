import express, { Request, Response } from 'express';
import initDB from './config/db';
import authRouter from './modules/auth/auth.routes';
import { config } from './config/env';
import auth from './middleware/auth';
import userRouter from './modules/user/user.routes';
import vehicleRouter from './modules/vehicle/vehicle.routes';
import bookingsRouter from './modules/bookings/bookings.routes';

const app = express();

initDB();

app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/vehicles", vehicleRouter);

app.use("/api/v1/bookings", bookingsRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the Vehicle Rental System API");
})

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
})