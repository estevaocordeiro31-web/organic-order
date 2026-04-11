/**
 * Authentication routes - JWT-based (removed Manus OAuth)
 * Supports email/password login compatible with BRAiN/Tutor
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { authService } from "./sdk";
import bcrypt from "bcrypt";

function getJsonBody(req: Request): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

export function registerOAuthRoutes(app: Express) {
  /**
   * POST /api/auth/login
   * Body: { email: string, password: string }
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const body = await getJsonBody(req);
      const { email, password } = body as Record<string, unknown>;

      if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      // Find user by email
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verify password (stored as bcrypt hash in users table)
      // Note: passwordHash field must exist in users table schema
      const passwordHash = (user as any).passwordHash || "";
      const passwordValid = await bcrypt.compare(password, passwordHash);
      if (!passwordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Create session token
      const sessionToken = await authService.createSessionToken(
        user.id.toString(),
        user.email || "",
        user.name || "",
        user.role as "user" | "admin" | undefined,
        { expiresInMs: ONE_YEAR_MS }
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        id: user.id,
        email: user.email,
        lastSignedIn: new Date(),
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * POST /api/auth/logout
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });

  /**
   * GET /api/auth/me
   * Returns current user info from session cookie
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await authService.authenticateRequest(req);
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}
