import express from 'express';
import { Request, Response } from 'express';
import { login, register, logout, checkAuth } from './Controllers/userController.js';

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    res.sendFile("public/index.html");
})

// Authentication endpoints

router.post("/login", login)
router.post("/register", register)
router.get("/logout", logout)
router.get("/verify", checkAuth)
