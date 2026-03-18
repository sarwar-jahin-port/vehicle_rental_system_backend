import { pool } from "../../config/db";

const createVehicleService = async (payload: Record<string, unknown>) => {
    const { vehicle_name, type, registration, dailyRentPrice, availabilityStatus } = payload;

    if (!vehicle_name || !type || !registration || dailyRentPrice === undefined) {
        throw new Error("Missing required fields: vehicle_name, type, registration, dailyRentPrice");
    }

    const result = await pool.query(
        `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
        [
            vehicle_name,
            type,
            registration,
            dailyRentPrice,
            availabilityStatus ?? true
        ]
    );

    return result.rows[0];
};

const getAllVehiclesService = async () => {
    const result = await pool.query(
        "SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles ORDER BY id ASC"
    );

    return result.rows;
};

const getVehicleByIdService = async (vehicleId: number) => {
    const result = await pool.query(
        "SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1",
        [vehicleId]
    );

    return result.rows[0] || null;
};

const updateVehicleByIdService = async (vehicleId: number, payload: Record<string, unknown>) => {
    const fieldMap: Record<string, string> = {
        vehicle_name: "vehicle_name",
        type: "type",
        registration: "registration_number",
        dailyRentPrice: "daily_rent_price",
        availabilityStatus: "availability_status"
    };

    const entries = Object.entries(payload).filter(
        ([key, value]) => Object.keys(fieldMap).includes(key) && value !== undefined
    );

    if (entries.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    const setClause = entries
        .map(([key], index) => `${fieldMap[key]} = $${index + 1}`)
        .join(", ");

    const values = entries.map(([, value]) => value);
    values.push(vehicleId);

    const result = await pool.query(
        `UPDATE vehicles SET ${setClause} WHERE id = $${entries.length + 1}
         RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
        values
    );

    return result.rows[0] || null;
};

const deleteVehicleByIdService = async (vehicleId: number) => {
    const bookingCheck = await pool.query(
        "SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active' LIMIT 1",
        [vehicleId]
    );

    if (bookingCheck.rows.length > 0) {
        throw new Error("Cannot delete vehicle with active bookings");
    }

    const result = await pool.query(
        "DELETE FROM vehicles WHERE id = $1 RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status",
        [vehicleId]
    );

    return result.rows[0] || null;
};

export const vehicleService = {
    createVehicleService,
    getAllVehiclesService,
    getVehicleByIdService,
    updateVehicleByIdService,
    deleteVehicleByIdService
};
