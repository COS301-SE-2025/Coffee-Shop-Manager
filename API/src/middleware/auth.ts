import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getClient } from "../supabase/client";

export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	let accessToken = req.cookies?.access_token;

	// Support for mobile clients (Authorization header)
	if (!accessToken && req.headers.authorization) {
		const parts = req.headers.authorization.split(" ");
		if (parts.length === 2 && parts[0] === "Bearer") {
			accessToken = parts[1];
		}
	}

	if (!accessToken) {
		return res.status(401).json({ error: "Missing access token. Please log in." });
	}

	// Attach a per-request Supabase client to the request
	req.supabase = getClient(accessToken);

	// Decode JWT and attach user info
	try {
		const decoded: any = jwt.decode(accessToken);
		if (decoded && decoded.sub) {
			req.user = { id: decoded.sub, ...decoded };
		} else {
			return res.status(401).json({ error: "Invalid access token." });
		}
	} catch (e) {
		return res.status(401).json({ error: "Failed to decode access token." });
	}

	next();
}