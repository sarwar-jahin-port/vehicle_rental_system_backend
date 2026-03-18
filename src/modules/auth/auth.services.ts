import bcrypt from "bcrypt";
import { pool } from "../../config/db";
import { config } from "../../config/env";
import jwt from "jsonwebtoken";

const createUserService = async (payload: Record<string, unknown>) => {
	const { name, email, password, phone, role } = payload;

	const emailExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
	if (emailExists.rows[0]) {
		throw new Error("Email already exists");
	}

	const phoneExists = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
	if (phoneExists.rows[0]) {
		throw new Error("Phone number already exists");
	}

	const hashedPassword = await bcrypt.hash(password as string, 10);

	const newUser = await pool.query(
		"INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
		[name, email, hashedPassword, phone, role]
	);

	if (!newUser.rows[0]) {
		throw new Error("Failed to create user");
	}

	return newUser.rows[0];
};

const loginService = async (payload: Record<string, unknown>) => {
    const { email, password } = payload;

    const emailExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (!emailExists.rows[0]) {
        throw new Error("Invalid email or password");
    }

    const user = emailExists.rows[0];

    const passwordMatch = await bcrypt.compare(password as string, user.password);

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    const jwtPayload = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } as jwt.JwtPayload;

    const token = jwt.sign(jwtPayload, config.jwtSecret as any, {expiresIn: config.jwtExpiresIn as any});

    return { user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token};
}

export const authService = {
	createUserService,
	loginService
};
