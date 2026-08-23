import { Request, Response } from "express"
import { extractToken, generateSession, loginUser, validateUserToken } from "../auth.js"
import { prisma } from "../db.js";
import bcrypt from "bcrypt"

export async function login(req: Request, res: Response) {
    try {
        const username = req.body.username
        const password = req.body.password
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password is required for autentication!",
            });
        }
        let login_result = await loginUser(username, password, req.headers['user-agent'] || null)
        if (login_result.success) {
            res.cookie("session_token", login_result.token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 90
            });
            return res.status(200).json({ message: login_result.message, token: login_result.token });
        }
        else { return res.status(400).json({ message: login_result.message, token: null }); }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", token: null });
    }
}

export async function register(req: Request, res: Response) {
    try {
        const username = req.body.username
        const password = req.body.password
        if (!username || !password) {
            return res.json({ message: "Invalid request, must contain username and password!" }).status(400)
        }
        const existsResult = await prisma.user.findMany({ where: { username: username } })
        if (existsResult.length != 0) {
            return res.json({ message: "User already exists!" }).status(409)
        }
        const token = extractToken(req)
        if (token) {
            const tokenResult = await validateUserToken(token, "admin")
            if (tokenResult.met) {
                await prisma.user.create({
                    data: {
                        username: username,
                        passwordHash: await bcrypt.hash(password, 10),
                        accepted: true
                    }
                })
                return res.json({ message: "User successfully created!" }).status(200)
            } else {
                const creationResult = await prisma.user.create({
                    data: {
                        username: username,
                        passwordHash: await bcrypt.hash(password, 10),
                        accepted: false
                    }
                })
                const sessionToken = await generateSession(creationResult.id, req.headers['user-agent'] || null)
                if (sessionToken) {
                    res.cookie("session_token", sessionToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "lax",
                        maxAge: 1000 * 60 * 60 * 24 * 90
                    });
                }
                return res.json({ message: "User successfully created!" }).status(200)
            }
        } else {
            const creationResult = await prisma.user.create({
                data: {
                    username: username,
                    passwordHash: await bcrypt.hash(password, 10),
                    accepted: false
                }
            })
            const sessionToken = await generateSession(creationResult.id, req.headers['user-agent'] || null)
            if (sessionToken) {
                res.cookie("session_token", sessionToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24 * 90
                });
            }
            return res.json({ message: "User successfully created!" }).status(200)
        }
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const token = extractToken(req)
        if (!token) {
            return res.json({ message: "No token in cookies, request invalid!" }).status(400)
        }
        const tokenResult = await validateUserToken(token, "user")
        if (!tokenResult.user) {
            return res.json({ message: "Invalid token!" }).status(400)
        } else {
            await prisma.token.delete({ where: { id: token } })
            return res.json({ message: "Successfully logged out!" }).status(200)
        }
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function checkAuth(req: Request, res: Response) {
    try {
        const token = extractToken(req)
        if (!token) {
            return res.json({ message: "No token found in cookies, invalid request!", user: null }).status(400)
        }
        const result = await validateUserToken(token, "user")
        if (!result.met){
            return res.json({ message: "Internal server error!", user: null }).status(401)
        }
        return res.json({ message: "Successfully retrieved user info!", user: result.user }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!", user: null }).status(500)
    }
}