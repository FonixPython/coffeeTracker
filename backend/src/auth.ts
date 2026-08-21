import { Request,Response,NextFunction } from "express";
import {prisma} from "./db.js"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

export type PermissionLevel = "none" | "user"|"admin"

export function PermissionResponse{
    userId:
}