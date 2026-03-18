import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingsController } from "./bookings.controller";

const bookingsRouter = Router();

bookingsRouter.post("/", auth("admin", "customer"), bookingsController.createBooking);

bookingsRouter.get("/", auth("admin", "customer"), bookingsController.getAllBookings);

bookingsRouter.get("/:bookingId", auth("admin", "customer"), bookingsController.getBookingById);

bookingsRouter.put("/:bookingId", auth("admin", "customer"), bookingsController.updateBookingById);

bookingsRouter.delete("/:bookingId", auth("admin"), bookingsController.deleteBookingById);

export default bookingsRouter;
