import { Request, Response } from "express"
import { extractToken, generateSession, loginUser, validateUserToken } from "../auth.js"
import { prisma } from "../db.js";
import bcrypt from "bcrypt"
import { measureMemory } from "vm";

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
            return res.json({ message: "No token!" }).status(200)
        }
        await prisma.token.delete({ where: { id: token } })
        return res.json({ message: "Successfully logged out!" }).status(200)

    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function deleteUser(req: Request & Record<string, any>, res: Response) {
    try {
        const result = await prisma.user.delete({
            where: { id: req.user.id }
        })
        if (!result) {
            return res.json({ message: "Failed to delete user!" }).status(500)
        }
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function checkAuth(req: Request & Record<string, any>, res: Response) {
    try {
        return res.json({ message: "Successfully retrieved user info!", user: req.user }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!", user: null }).status(500)
    }
}

export async function editUser(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.body.username || !req.body.accepted || !req.body.pfpId || !req.body.admin) {
            return res.json({ message: "Invalid request, must contain all user properties!" }).status(400)
        }
        let result
        if (req.user.permission == "admin" && req.body.id) {
            result = await prisma.user.update({
                where: { id: req.body.id }, data: {
                    username: req.body.username,
                    accepted: req.body.accepted,
                    pfpId: req.body.pfpId,
                    admin: req.body.admin
                }
            })
        } else {
            result = await prisma.user.update({
                where: { id: req.user.id }, data: {
                    username: req.body.username,
                    accepted: req.body.accepted,
                    pfpId: req.body.pfpId,
                    admin: req.body.admin
                }
            })
        }
        if (!result) {
            return res.json({ message: "User not found!" }).status(404)
        }
        return res.json({ message: "Successfully edited user!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function changePassword(req: Request & Record<string, any>, res: Response) {
    try {
        const oldPassword = req.body.oldPassword
        const newPassword = req.body.newPassword
        if (!oldPassword || !newPassword) {
            return res.json({ message: "Invalid request!" }).status(401)
        }
        const currentUser = await prisma.user.findFirstOrThrow({ where: { id: req.user.id } })
        if (await bcrypt.compare(oldPassword, currentUser.passwordHash) || req.user.permission == "admin") {
            const result = await prisma.user.update({
                where: { id: req.user.id }, data: {
                    passwordHash: await bcrypt.hash(newPassword, 10)
                }
            })
            if (!result) {
                return res.json({ message: "Internal server error!" }).status(500)
            }
            return res.json({ message: "Successfully changed password!" }).status(200)
        }
        return res.json({ message: "Old password is incorrect!" }).status(401)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}