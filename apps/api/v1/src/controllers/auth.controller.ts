import { getDb, users } from "@plantingwise/database";
import { loginSchema, registerSchema } from "@plantingwise/schemas";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getApiEnv } from "../environment";
import { clearSessionCookie, setSessionCookie } from "../middleware/auth.middleware";
import { sendZodError } from "../middleware/validation.middleware";

export async function register(request: Request, response: Response): Promise<void> {
	const parsed = registerSchema.safeParse(request.body);
	if (!parsed.success) {
		sendZodError(response, parsed.error.issues);
		return;
	}

	const db = getDb(getApiEnv().DATABASE_URL);
	const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);

	if (existing) {
		response.status(409).json({ error: "An account with this email already exists.", code: "EMAIL_IN_USE" });
		return;
	}

	const passwordHash = await bcrypt.hash(parsed.data.password, 12);
	const [user] = await db
		.insert(users)
		.values({ name: parsed.data.name, email: parsed.data.email, passwordHash })
		.returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt });

	setSessionCookie(response, { id: user.id, name: user.name, email: user.email });
	response.status(201).json({ user });
}

export async function login(request: Request, response: Response): Promise<void> {
	const parsed = loginSchema.safeParse(request.body);
	if (!parsed.success) {
		sendZodError(response, parsed.error.issues);
		return;
	}

	const db = getDb(getApiEnv().DATABASE_URL);
	const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
	if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
		response.status(401).json({ error: "Email or password is incorrect.", code: "INVALID_CREDENTIALS" });
		return;
	}

	setSessionCookie(response, { id: user.id, name: user.name, email: user.email });
	response.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
}

export function getCurrentSession(request: Request, response: Response): void {
	response.json({
		user: { id: request.userId!, name: request.userName!, email: request.userEmail! },
	});
}

export function logout(_request: Request, response: Response): void {
	clearSessionCookie(response);
	response.status(204).end();
}
