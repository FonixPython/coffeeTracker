import { Request, Response } from "express";
import { prisma } from "../db.js";
import { calculateCoffeeCost } from "./userActionController.js";


export async function getAllUsers(req: Request, res: Response) {
    try {
        const result = await prisma.user.findMany()
        return res.json({ message: "Successfully retrieved users!", result: result })
    } catch (e) {
        console.log()
        return res.json({ message: "Intarnal server error!", result: null }).status(500)
    }
}

// Pool CRUD

export async function getPools(req: Request, res: Response) {
    try {
        const result = await prisma.pool.findMany({ include: { transactions: true } })
        return res.json({ message: "Successfully retrieved pools!", result: result }).status(500)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!", result: null }).status(500)
    }
}

export async function addPool(req: Request, res: Response) {
    try {
        if (!req.body.name) {
            return res.json({ message: "No pool name in request!" }).status(400)
        }
        const result = await prisma.pool.create({ data: { name: req.body.name } })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        }
        return res.json({ message: "Successfully added pool!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function editPool(req: Request, res: Response) {
    try {
        if (!req.body.name || !req.params.poolId) {
            return res.json({ message: "No pool name in request!" }).status(400)
        }
        const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId;
        const result = await prisma.pool.update({ where: { id: poolId }, data: { name: req.body.name } })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        }
        return res.json({ message: "Successfully edited pool!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function deletePool(req: Request, res: Response) {
    try {
        if (!req.params.poolId) {
            return res.json({ message: "No pool name in request!" }).status(400)
        }
        const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId;
        const result = await prisma.pool.delete({ where: { id: poolId } })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        }
        return res.json({ message: "Successfully deleted pool!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

// Variations CRUD

export async function addVariation(req: Request, res: Response) {
    try {
        if (!req.body.id || !req.body.coffeeAmount) {
            return res.json({ message: "Invalid request!" }).status(400)
        }
        const result = await prisma.coffeeVariation.create({ data: { id: req.body.id, coffeeAmount: req.body.coffeeAmount } })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        }
        return res.json({ message: "Successfully added variation!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
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
        await prisma.$transaction(
            transactions.map((transaction) =>
                prisma.transaction.update({
                    where: {
                        id: transaction.id,
                    },
                    data: {
                        coffeeVariationId: req.body.name,
                        coffeeAmount: req.body.coffeeAmount,
                        moneyAmount: req.body.coffeeAmount * (calculateCoffeeCost(transaction.poolId) || 0),
                    },
                })
            )
        )
        const result = await prisma.coffeeVariation.create({ data: { id: req.body.id, coffeeAmount: req.body.coffeeAmount } })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        }
        return res.json({ message: "Successfully edited varitaion!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function deleteVariation(req: Request, res: Response) {
    try {
        if (!req.params.variationId) {
            return res.json({ message: "No pool name in request!" }).status(400)
        }
        const variationId = Array.isArray(req.params.variationId) ? req.params.variationId[0] : req.params.variationId;
        const result = await prisma.coffeeVariation.delete({ where: { id: variationId } })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        }
        return res.json({ message: "Successfully deleted variation!" }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}
