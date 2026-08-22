import { Request, Response, NextFunction } from "express";
import { prisma } from "./db.js"
import bcrypt from "bcrypt"

export type PermissionLevel = "none" | "user" | "admin"

export interface UserObject {
    id: string,
    username: string,
    accepted: boolean,
    pfpId: string,
    permission: PermissionLevel,
    dateOfRegistration: Date
}

export interface PermissionResponse {
    user: UserObject | null,
    met: boolean
}

export interface loginResponse {
    token: string | null,
    success: boolean,
    message: string
}

export function extractToken(req: Request): string | null {
    return req.cookies?.sessionToken || req.headers.authorization || null
}

export async function validateUserToken(token: string, validateTo: PermissionLevel | null): Promise<PermissionResponse> {
    try {
        const tokenResult = await prisma.token.findFirstOrThrow({ where: { id: token }, include: { user: true } })
        if (!tokenResult.user.accepted) {
            return { user: null, met: false }
        }
        const permission: PermissionLevel = tokenResult.user.admin ? "admin" : "user";
        return {
            user: {
                id: tokenResult.userId,
                username: tokenResult.user.username,
                accepted: true,
                pfpId: tokenResult.user.pfpId,
                permission: permission,
                dateOfRegistration: tokenResult.dateOfLogin
            },
            met: validateTo != null ? (validateTo === permission || permission === "admin") : false
        }
    } catch (e) {
        console.log(e)
        return { user: null, met: false }
    }
}

export async function generateSession(userId: string, userAgent: string | null): Promise<string | null> {
    try {
        let agentText: string = ""
        if (userAgent !== null) { agentText = userAgent }
        let result = await prisma.token.create({ data: { userId: userId, user_agent: agentText } })
        return result.id;
    } catch (err) {
        console.log(err)
        return null;
    }
}

export async function loginUser(username: string, password: string, userAgent: string | null): Promise<loginResponse> {
    try {
        const userResult = await prisma.user.findUniqueOrThrow({ where: { username: username } })
        const isMatch = await bcrypt.compare(password, userResult.passwordHash);
        if (isMatch) {
            let newToken: string | null = await generateSession(userResult.id, userAgent)
            if (newToken === null) { return { token: null, success: false, message: "Failed to generate token!" } }
            else { return { token: newToken, success: true, message: "Success" } }
        } else {
            return { token: null, success: false, message: "Invalid credentials!" }
        }
    }
    catch (err) {
        return { token: null, success: false, message: "User does not exist!" }
    }
}

export async function logoutUser(token: string): Promise<boolean> {
    try {
        await prisma.token.delete({ where: { id: token } })
        return true;
    } catch {
        return false;
    }
}
export async function checkUser(username: string) {
    try {
        const result = await prisma.user.findFirstOrThrow({ where: { username: username } })
        return true
    } catch { return false }
}

export async function authenticateUser(req: Request & Record<string, any>, res: Response, next: NextFunction) {
    const auth = extractToken(req);
    if (!auth) return res.sendStatus(401);
    let userPermission = await validateUserToken(auth, null);
    if (!userPermission.user) { return res.sendStatus(401) }
    if (userPermission.user.permission === "none") { return res.sendStatus(401); }
    req.user = { id: userPermission.user.id };
    next();
}

