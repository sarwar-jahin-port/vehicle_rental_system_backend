import { pool } from "../../config/db";

const getAllUsersService = async () => {
	const result = await pool.query("SELECT id, name, email, phone, role FROM users");
	return result.rows;
};

const getUserByIdService = async (userId: number) => {
	const result = await pool.query(
		"SELECT id, name, email, phone, role FROM users WHERE id = $1",
		[userId]
	);

	return result.rows[0] || null;
};

const updateUserByIdService = async (
	userId: number,
	payload: Record<string, unknown>,
	requesterRole?: string
) => {
	const allowedFields = ["name", "email", "phone", "role"] as const;
	const entries = Object.entries(payload).filter(
		([key, value]) => allowedFields.includes(key as (typeof allowedFields)[number]) && value !== undefined
	);

	// Customers are not allowed to update role, even for their own account.
	const filteredEntries = requesterRole === "admin"
		? entries
		: entries.filter(([key]) => key !== "role");

	if (filteredEntries.length === 0) {
		throw new Error("No valid fields provided for update");
	}

	const setClause = filteredEntries
		.map(([key], index) => `${key} = $${index + 1}`)
		.join(", ");

	const values = filteredEntries.map(([, value]) => value);
	values.push(userId);

	const result = await pool.query(
		`UPDATE users SET ${setClause} WHERE id = $${filteredEntries.length + 1} RETURNING id, name, email, phone, role`,
		values
	);

	return result.rows[0] || null;
};

const deleteUserByIdService = async (userId: number) => {
	const result = await pool.query(
		"DELETE FROM users WHERE id = $1 RETURNING id, name, email, phone, role",
		[userId]
	);

	return result.rows[0] || null;
};

export const userService = {
	getAllUsersService,
	getUserByIdService,
	updateUserByIdService,
	deleteUserByIdService
};
