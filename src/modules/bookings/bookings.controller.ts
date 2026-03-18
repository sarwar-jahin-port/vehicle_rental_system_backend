import { Request, Response } from "express";
import { bookingsService } from "./bookings.services";

const createBooking = async (req: Request, res: Response) => {
    const requesterRole = String(req.user?.role || "");
    const requesterId = Number(req.user?.id);

    if (requesterRole === "customer") {
        req.body.customer_id = requesterId;
    }

    if (requesterRole !== "admin" && Number(req.body.customer_id) !== requesterId) {
        return res.status(403).json({ success: false, message: "Forbidden: You can only create your own booking" });
    }

    try {
        const booking = await bookingsService.createBookingService(req.body);
        return res.status(201).json({ success: true, message: "Booking created successfully", booking });
    } catch (error: any) {
        const status = error.code === "23503" ? 400 : 400;
        return res.status(status).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const getAllBookings = async (req: Request, res: Response) => {
    const requesterRole = String(req.user?.role || "");
    const requesterId = Number(req.user?.id);

    try {
        const bookings = await bookingsService.getAllBookingsService(requesterRole, requesterId);
        return res.status(200).json({ success: true, bookings });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const getBookingById = async (req: Request, res: Response) => {
    const bookingId = Number(req.params.bookingId);
    const requesterRole = String(req.user?.role || "");
    const requesterId = Number(req.user?.id);

    if (!bookingId || Number.isNaN(bookingId)) {
        return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    try {
        const booking = await bookingsService.getBookingByIdService(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (requesterRole !== "admin" && Number(booking.customer_id) !== requesterId) {
            return res.status(403).json({ success: false, message: "Forbidden: You can only access your own booking" });
        }

        return res.status(200).json({ success: true, booking });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const updateBookingById = async (req: Request, res: Response) => {
    const bookingId = Number(req.params.bookingId);
    const requesterRole = String(req.user?.role || "");
    const requesterId = Number(req.user?.id);

    if (!bookingId || Number.isNaN(bookingId)) {
        return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    try {
        const existing = await bookingsService.getBookingByIdService(bookingId);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (requesterRole !== "admin" && Number(existing.customer_id) !== requesterId) {
            return res.status(403).json({ success: false, message: "Forbidden: You can only update your own booking" });
        }

        const booking = await bookingsService.updateBookingByIdService(bookingId, req.body, requesterRole);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({ success: true, message: "Booking updated successfully", booking });
    } catch (error: any) {
        const status = error.message === "No valid fields provided for update" ? 400 : 400;
        return res.status(status).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

const deleteBookingById = async (req: Request, res: Response) => {
    const bookingId = Number(req.params.bookingId);

    if (!bookingId || Number.isNaN(bookingId)) {
        return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    try {
        const booking = await bookingsService.deleteBookingByIdService(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({ success: true, message: "Booking deleted successfully", booking });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error
        });
    }
};

export const bookingsController = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingById,
    deleteBookingById
};
