import { pool } from "../../config/db";

const ALLOWED_STATUS = ["active", "cancelled", "returned"];

const createBookingService = async (payload: Record<string, unknown>) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status } = payload;

    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date || total_price === undefined) {
        throw new Error("Missing required fields");
    }

    const startDate = new Date(String(rent_start_date));
    const endDate = new Date(String(rent_end_date));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new Error("Invalid booking date");
    }

    if (endDate <= startDate) {
        throw new Error("rent_end_date must be after rent_start_date");
    }

    const totalPrice = Number(total_price);
    if (Number.isNaN(totalPrice) || totalPrice <= 0) {
        throw new Error("total_price must be a positive number");
    }

    const bookingStatus = status ? String(status) : "active";
    if (!ALLOWED_STATUS.includes(bookingStatus)) {
        throw new Error("Invalid status. Allowed values: active, cancelled, returned");
    }

    const result = await pool.query(
        `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice, bookingStatus]
    );

    return result.rows[0];
};

const getAllBookingsService = async (requesterRole: string, requesterId: number) => {
    if (requesterRole === "admin") {
        const result = await pool.query(
            "SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings ORDER BY id ASC"
        );
        return result.rows;
    }

    const result = await pool.query(
        "SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE customer_id = $1 ORDER BY id ASC",
        [requesterId]
    );

    return result.rows;
};

const getBookingByIdService = async (bookingId: number) => {
    const result = await pool.query(
        "SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE id = $1",
        [bookingId]
    );

    return result.rows[0] || null;
};

const updateBookingByIdService = async (bookingId: number, payload: Record<string, unknown>, requesterRole: string) => {
    const fieldMap: Record<string, string> = {
        customer_id: "customer_id",
        vehicle_id: "vehicle_id",
        rent_start_date: "rent_start_date",
        rent_end_date: "rent_end_date",
        total_price: "total_price",
        status: "status"
    };

    const entries = Object.entries(payload).filter(
        ([key, value]) => Object.keys(fieldMap).includes(key) && value !== undefined
    );

    if (entries.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    if (requesterRole !== "admin") {
        const hasRestrictedField = entries.some(([key]) => key === "customer_id" || key === "status");
        if (hasRestrictedField) {
            throw new Error("Only admin can update customer_id or status");
        }
    }

    const nextStart = payload.rent_start_date;
    const nextEnd = payload.rent_end_date;
    if (nextStart !== undefined || nextEnd !== undefined) {
        const existing = await getBookingByIdService(bookingId);
        if (!existing) {
            return null;
        }

        const startDate = new Date(String(nextStart ?? existing.rent_start_date));
        const endDate = new Date(String(nextEnd ?? existing.rent_end_date));
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new Error("Invalid booking date");
        }

        if (endDate <= startDate) {
            throw new Error("rent_end_date must be after rent_start_date");
        }
    }

    if (payload.total_price !== undefined) {
        const totalPrice = Number(payload.total_price);
        if (Number.isNaN(totalPrice) || totalPrice <= 0) {
            throw new Error("total_price must be a positive number");
        }
    }

    if (payload.status !== undefined && !ALLOWED_STATUS.includes(String(payload.status))) {
        throw new Error("Invalid status. Allowed values: active, cancelled, returned");
    }

    const setClause = entries
        .map(([key], index) => `${fieldMap[key]} = $${index + 1}`)
        .join(", ");

    const values = entries.map(([, value]) => value);
    values.push(bookingId);

    const result = await pool.query(
        `UPDATE bookings SET ${setClause} WHERE id = $${entries.length + 1}
         RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
        values
    );

    return result.rows[0] || null;
};

const deleteBookingByIdService = async (bookingId: number) => {
    const result = await pool.query(
        "DELETE FROM bookings WHERE id = $1 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
        [bookingId]
    );

    return result.rows[0] || null;
};

export const bookingsService = {
    createBookingService,
    getAllBookingsService,
    getBookingByIdService,
    updateBookingByIdService,
    deleteBookingByIdService
};
