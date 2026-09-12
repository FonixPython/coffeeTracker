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
            res.cookie("sessionToken", login_result.token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 90
            });
            return res.status(200).json({ message: login_result.message, token: login_result.token });
        }
        if (login_result.message == "User account unapproved!") {
            return res.status(403).json({ message: login_result.message, token: null })
        }
        else { return res.status(401).json({ message: login_result.message, token: null }); }
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
            return res.status(400).json({ message: "Invalid request, must contain username and password!" })
        }
        const existsResult = await prisma.user.findMany({ where: { username: username } })
        if (existsResult.length != 0) {
            console.log(existsResult.length)
            return res.status(409).json({ message: "User already exists!" })
        }
        const token = extractToken(req)
        if (token) {
            const tokenResult = await validateUserToken(token, "admin")
            if (tokenResult.met) {
                await prisma.user.create({
                    data: {
                        username: username,
                        passwordHash: await bcrypt.hash(password, 10),
                        admin: Boolean(req.body.admin),
                        accepted: true,
                        pfpId: null
                    }
                })
                return res.status(200).json({ message: "User successfully created!" })
            } else {
                const users = await prisma.user.findMany()
                const creationResult = await prisma.user.create({
                    data: {
                        username: username,
                        passwordHash: await bcrypt.hash(password, 10),
                        accepted: users.length == 0 ? true : false,
                        admin: users.length == 0 ? true : false,
                        pfpId: null
                    }
                })
                if (!creationResult) {
                    return res.status(500).json({ message: "Internal server error!" })
                }
                const sessionToken = await generateSession(creationResult.id, req.headers['user-agent'] || null)
                if (sessionToken) {
                    res.cookie("sessionToken", sessionToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "lax",
                        maxAge: 1000 * 60 * 60 * 24 * 90
                    });
                }
                return res.status(200).json({ message: "User successfully created!" })
            }
        } else {
            const users = await prisma.user.findMany()
            const creationResult = await prisma.user.create({
                data: {
                    username: username,
                    passwordHash: await bcrypt.hash(password, 10),
                    accepted: users.length == 0 ? true : false,
                    admin: users.length == 0 ? true : false,
                    pfpId: null
                }
            })
            if (!creationResult) {
                return res.status(500).json({ message: "Internal server error!" })
            }
            const sessionToken = await generateSession(creationResult.id, req.headers['user-agent'] || null)
            if (sessionToken) {
                res.cookie("sessionToken", sessionToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24 * 90
                });
            }
            return res.status(200).json({ message: "User successfully created!" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const token = extractToken(req)
        if (!token) {
            return res.status(200).json({ message: "No token!" })
        }
        await prisma.token.delete({ where: { id: token } })
        return res.status(200).json({ message: "Successfully logged out!" })

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function deleteUser(req: Request & Record<string, any>, res: Response) {
    try {
        const result = await prisma.user.delete({
            where: { id: req.user.id }
        })
        if (!result) {
            return res.status(500).json({ message: "Failed to delete user!" })
        }
        return res.json({ message: "Sucessfully deleted user!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function checkAuth(req: Request & Record<string, any>, res: Response) {
    try {
        return res.status(200).json({ message: "Successfully retrieved user info!", user: req.user })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", user: null })
    }
}

export async function editUser(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.body.username || !req.body.accepted || !req.body.pfpId || !req.body.admin) {
            return res.status(400).json({ message: "Invalid request, must contain all user properties!" })
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
            return res.status(404).json({ message: "User not found!" })
        }
        return res.status(200).json({ message: "Successfully edited user!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function changePassword(req: Request & Record<string, any>, res: Response) {
    try {
        const oldPassword = req.body.oldPassword
        const newPassword = req.body.newPassword
        if (!oldPassword || !newPassword) {
            return res.status(401).json({ message: "Invalid request!" })
        }
        const currentUser = await prisma.user.findFirstOrThrow({ where: { id: req.user.id } })
        if (await bcrypt.compare(oldPassword, currentUser.passwordHash) || req.user.permission == "admin") {
            const result = await prisma.user.update({
                where: { id: req.user.id }, data: {
                    passwordHash: await bcrypt.hash(newPassword, 10)
                }
            })
            if (!result) {
                return res.status(500).json({ message: "Internal server error!" })
            }
            return res.status(200).json({ message: "Successfully changed password!" })
        }
        return res.status(401).json({ message: "Old password is incorrect!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}