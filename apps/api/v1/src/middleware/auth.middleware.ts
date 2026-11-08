import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getApiEnv } from "../environment";

const COOKIE_NAME = "plantingwise_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

export type SessionClaims = JwtPayload & { sub: string; email: string; name: string };

function jwtSecret() {
	const environment = getApiEnv();
	if (environment.JWT_SECRET) return environment.JWT_SECRET;
	if (environment.NODE_ENV !== "production") {
		return "local-development-secret-change-this-before-deploying-plantingwise";
	}
	throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

function cookieOptions() {
	const environment = getApiEnv();
	const sameSite = environment.COOKIE_SAME_SITE;
	return {
		httpOnly: true,
		secure: environment.NODE_ENV === "production" || sameSite === "none",
		sameSite: sameSite as "lax" | "strict" | "none",
		path: "/",
		maxAge: SESSION_SECONDS * 1000,
	};
}

export function setSessionCookie(res: Response, user: { id: string; email: string; name: string }) {
	const token = jwt.sign({ email: user.email, name: user.name }, jwtSecret(), {
		subject: user.id,
		expiresIn: SESSION_SECONDS,
		issuer: "plantingwise-api",
		audience: "plantingwise-client",
	});
	res.cookie(COOKIE_NAME, token, cookieOptions());
}

export function clearSessionCookie(res: Response) {
	const options = cookieOptions();
	delete (options as { maxAge?: number }).maxAge;
	res.clearCookie(COOKIE_NAME, options);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies?.[COOKIE_NAME] as string | undefined;
	if (!token) {
		res.status(401).json({ error: "Please sign in to access your garden.", code: "UNAUTHENTICATED" });
		return;
	}
	try {
		const claims = jwt.verify(token, jwtSecret(), {
			issuer: "plantingwise-api",
			audience: "plantingwise-client",
		}) as SessionClaims;
		if (!claims.sub || typeof claims.email !== "string" || typeof claims.name !== "string") {
			res.status(401).json({ error: "Invalid session. Please sign in again.", code: "INVALID_SESSION" });
			return;
		}
		req.userId = claims.sub;
		req.userEmail = claims.email;
		req.userName = claims.name;
		next();
	} catch {
		clearSessionCookie(res);
		res.status(401).json({ error: "Your session has expired. Please sign in again.", code: "SESSION_EXPIRED" });
	}
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies?.[COOKIE_NAME] as string | undefined;
	if (!token) {
		next();
		return;
	}
	try {
		const claims = jwt.verify(token, jwtSecret(), {
			issuer: "plantingwise-api",
			audience: "plantingwise-client",
		}) as SessionClaims;
		if (claims.sub && typeof claims.email === "string" && typeof claims.name === "string") {
			req.userId = claims.sub;
			req.userEmail = claims.email;
			req.userName = claims.name;
		}
	} catch {
		clearSessionCookie(res);
	}
	next();
}
