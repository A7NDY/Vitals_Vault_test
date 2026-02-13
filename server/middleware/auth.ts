import { Request, Response, NextFunction } from "express";

/**
 * Extended Express Request with user data
 */
export interface AuthRequest extends Request {
  user?: {
    email: string;
    role: "Patient" | "Doctor" | "Admin";
    userId?: string;
  };
}

/**
 * Authentication Middleware
 * Verifies user is logged in via session/token
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // In production, verify JWT token from Authorization header
    // For now, check if user data exists in session/request
    const authHeader = req.headers.authorization;

    if (!authHeader && !req.headers["x-user-email"]) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Extract user info from headers (in production, decode JWT token)
    const userEmail = (req.headers["x-user-email"] as string) || "";
    const userRole = (req.headers["x-user-role"] as string) || "Patient";

    if (!userEmail) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User email required",
      });
      return;
    }

    // Attach user to request
    req.user = {
      email: userEmail,
      role: userRole as "Patient" | "Doctor" | "Admin",
      userId: userEmail, // Use email as userId for now
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication",
    });
  }
}

/**
 * Role-Based Access Control Middleware
 * Restricts access to specific user roles
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: `This resource requires one of: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Patient-Only Middleware
 * Restricts access to Patient role only (with exception for Doctors accessing their patients)
 */
export function requirePatient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
    return;
  }

  // Allow Admin and Patient, restrict Doctor
  if (!["Patient", "Admin"].includes(req.user.role)) {
    res.status(403).json({
      error: "Forbidden",
      message: "Patients only",
    });
    return;
  }

  next();
}

/**
 * Doctor-Only Middleware
 * Restricts access to Doctor role
 */
export function requireDoctor(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
    return;
  }

  if (!["Doctor", "Admin"].includes(req.user.role)) {
    res.status(403).json({
      error: "Forbidden",
      message: "Doctors only",
    });
    return;
  }

  next();
}

/**
 * Admin-Only Middleware
 * Restricts access to Admin role
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
    return;
  }

  if (req.user.role !== "Admin") {
    res.status(403).json({
      error: "Forbidden",
      message: "Admin access required",
    });
    return;
  }

  next();
}

export default {
  authMiddleware,
  requireRole,
  requirePatient,
  requireDoctor,
  requireAdmin,
};
