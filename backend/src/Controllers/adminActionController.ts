import { Request, Response } from "express";
import { prisma } from "../db.js";
import { calculateCoffeeCost } from "./userActionController.js";


export async function getAllUsers(req: Request, res: Response) {
    try {
        const result = await prisma.user.findMany({ include: { transactions: { orderBy: { dateOfTransaction: "desc" }, include: { pool: { select: { name: true } } } } }, omit: { passwordHash: true } })
        return res.json({ message: "Successfully retrieved users!", result: result })
    } catch (e) {
        console.log()
        return res.json({ message: "Intarnal server error!", result: null }).status(500)
    }
}

export async function deleteSpecifiedUser(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ message: "Invalid request!" })
        }
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
        const result = await prisma.user.delete({
            where: { id: userId }
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

// Pool CRUD

export async function getPools(req: Request, res: Response) {
    try {
        const result = await prisma.pool.findMany({ include: { transactions: { where: { type: { notIn: ["useUpMoney"] } }, orderBy: { dateOfTransaction: "desc" }, include: { user: { select: { username: true } } } } } })
        return res.json({ message: "Successfully retrieved pools!", result: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", result: null })
    }
}

export async function addPool(req: Request, res: Response) {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: "No pool name in request!" })
        }
        const result = await prisma.pool.create({ data: { name: req.body.name } })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        }
        return res.json({ message: "Successfully added pool!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function editPool(req: Request, res: Response) {
    try {
        if (!req.body.name || !req.params.poolId) {
            return res.status(400).json({ message: "No pool name in request!" })
        }
        const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId;
        const result = await prisma.pool.update({ where: { id: poolId }, data: { name: req.body.name } })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        }
        return res.json({ message: "Successfully edited pool!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function deletePool(req: Request, res: Response) {
    try {
        if (!req.params.poolId) {
            return res.status(400).json({ message: "No pool name in request!" })
        }
        const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId;
        const result = await prisma.pool.delete({ where: { id: poolId } })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        }
        return res.json({ message: "Successfully deleted pool!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

// Variations CRUD

export async function addVariation(req: Request, res: Response) {
    try {
        if (!req.body.id || !req.body.coffeeAmount) {
            return res.status(400).json({ message: "Invalid request!" })
        }
        const result = await prisma.coffeeVariation.create({ data: { id: req.body.id, coffeeAmount: req.body.coffeeAmount } })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        }
        return res.json({ message: "Successfully added variation!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function editVariation(req: Request, res: Response) {
    try {
        if (!req.body.id || !req.body.name || !req.body.coffeeAmount) {
            return res.json({ message: "Invalid request" }).status(400)
        }
        const transactions = await prisma.transaction.findMany({
            where: {
                coffeeVariationId: req.body.id,
            },
            select: {
                id: true,
                poolId: true,
            },
        })
        const transactionData = await Promise.all(
            transactions.map(async (transaction) => {
                const coffeeCost = await calculateCoffeeCost(transaction.poolId)

                return {
                    id: transaction.id,
                    moneyAmount: req.body.coffeeAmount * (coffeeCost ?? 0),
                }
            })
        )

        const updates = transactionData.map((transaction) =>
            prisma.transaction.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    coffeeVariationId: req.body.id,
                    coffeeAmount: req.body.coffeeAmount,
                    moneyAmount: transaction.moneyAmount,
                },
            })
        )

        await prisma.$transaction(updates)
        const result = await prisma.coffeeVariation.update({ where: { id: req.body.id }, data: { id: req.body.name, coffeeAmount: req.body.coffeeAmount } })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        }
        return res.status(200).json({ message: "Successfully edited varitaion!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function deleteVariation(req: Request, res: Response) {
    try {
        if (!req.params.variationId) {
            return res.status(400).json({ message: "No pool name in request!" })
        }
        const variationId = Array.isArray(req.params.variationId) ? req.params.variationId[0] : req.params.variationId;
        const result = await prisma.coffeeVariation.delete({ where: { id: variationId } })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        }
        return res.json({ message: "Successfully deleted variation!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}
