import { Request, Response } from "express";
import { prisma } from "../db.js"

export async function getBalances(req: Request & Record<string, any>, res: Response) {
    try {
        const pools = await prisma.pool.findMany()
        const resultObject = []
        for (let i = 0; i < pools.length; i++) {
            const moneyAmount = await prisma.transaction.aggregate({ where: { poolId: pools[i].id, userId: req.user.id }, _sum: { moneyAmount: true } })
            const coffeeAmount = await prisma.transaction.aggregate({ _sum: { coffeeAmount: true } })
            resultObject.push({
                poolId: pools[i].id,
                poolName: pools[i].name,
                moneyBalance: moneyAmount._sum.moneyAmount,
                coffeeAmount: coffeeAmount._sum.coffeeAmount
            })
        }
        return res.json({ message: "Successfully retrieved balances!", result: resultObject })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", result: [] })
    }
}

export async function getTransactions(req: Request & Record<string, any>, res: Response) {
    try {
        const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId;
        const transactions = await prisma.transaction.findMany({ where: { userId: req.user.id, poolId: poolId } })
        const currentTime = Date.now()
        const returnArray = []
        for (let i = 0; i < transactions.length; i++) {
            returnArray.push({
                ...transactions[i],
                edit: currentTime - transactions[i].dateOfTransaction.getTime() < 1000 * 60 * 60
            })
        }
        return res.json({ message: "Successfully retrieved transactions!", result: transactions || [] }).status(200)
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", result: [] })
    }
}

export function calculateCoffeeCost(poolId: string): number | null {
    try {
        const poolData = prisma.transaction.aggregate({ where: { poolId: poolId, type: { in: ["drink", "addCoffee"] } }, _sum: { coffeeAmount: true, moneyAmount: true } })
        poolData.then((data) => {
            if (!data._sum.moneyAmount || !data._sum.coffeeAmount) {
                return null
            }
            return data._sum.moneyAmount / data._sum.coffeeAmount
        })
        return null
    } catch (e) {
        console.log(e)
        throw e
    }
}

export async function addTransaction(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.body.poolId || !req.body.moneyAmount || !req.body.coffeeAmount || !req.body.type || !req.body.coffeeVariation) {
            return res.status(400).json({ message: "Invalid request!", result: null })
        }
        const data = {
            coffeeAmount: req.body.coffeeAmount,
            moneyAmount: req.body.moneyAmount
        }
        switch (req.body.type) {
            case "drink":
                const coffeeCost = calculateCoffeeCost(req.body.poolId)
                if (!coffeeCost) {
                    return res.status(500).json({ message: "No coffee" })
                }
                const variation = await prisma.coffeeVariation.findFirstOrThrow({ where: { id: req.body.coffeeVariation } })
                data.coffeeAmount = variation.coffeeAmount * -1
                data.moneyAmount = data.coffeeAmount * coffeeCost
                break
            case "addCoffee":
                data.coffeeAmount = data.coffeeAmount > 0 ? data.coffeeAmount : data.coffeeAmount * -1
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                break
            case "addMoney":
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                data.coffeeAmount = 0
                break
            default:
                return res.status(400).json({ message: "Invalid transaction type!" })
        }
        const result = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                poolId: req.body.poolId,
                type: req.body.type,
                moneyAmount: data.moneyAmount,
                coffeeAmount: data.coffeeAmount,
                coffeeVariationId: req.body.coffeeVariation
            }
        })
        if (!result) {
            return res.status(500).json({ message: "Internal server error!" })
        } else {
            return res.status(200).json({ message: "Successfully added transaction!" })
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function editTransaction(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.params.transactionId || !req.body.moneyAmount || !req.body.coffeeAmount || !req.body.type || !req.body.coffeeVariation) {
            return res.status(400).json({ message: "Invalid request!", result: null })
        }
        const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
        const data = {
            coffeeAmount: req.body.coffeeAmount,
            moneyAmount: req.body.moneyAmount
        }
        const before = await prisma.transaction.findFirstOrThrow({ where: { id: transactionId } })
        switch (req.body.type) {
            case "drink":
                const coffeeCost = calculateCoffeeCost(before.poolId)
                if (!coffeeCost) {
                    return res.status(500).json({ message: "No coffee" })
                }
                const variation = await prisma.coffeeVariation.findFirstOrThrow({ where: { id: req.body.coffeeVariation } })
                data.coffeeAmount = variation.coffeeAmount * -1
                data.moneyAmount = data.coffeeAmount * coffeeCost
                break
            case "addCoffee":
                data.coffeeAmount = data.coffeeAmount > 0 ? data.coffeeAmount : data.coffeeAmount * -1
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                break
            case "addMoney":
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                data.coffeeAmount = 0
                break
            default:
                return res.status(400).json({ message: "Invalid transaction type!" })
        }
        if (req.user.permission == "user" && Date.now() - before.dateOfTransaction.getTime() < 1000 * 60 * 60) {
            return res.status(401).json({ message: "Transaction too old to edit!" })
        }

        const result = await prisma.transaction.update({
            where: (req.user.permission == "user") ? { id: transactionId, userId: req.user.id } : { id: transactionId },
            data: {
                type: req.body.type,
                coffeeAmount: data.coffeeAmount,
                moneyAmount: data.moneyAmount,
                coffeevariation: req.body.coffeeVariation
            }
        })
        if (!result) {
            return res.status(401).json({ message: "Can't edit transaction!" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function deleteTransaction(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.params.transactionId) {
            return res.status(400).json({ message: "Invalid request!", result: null })
        }
        const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
        const result = await prisma.transaction.delete({
            where: req.user.permission == "user" ? { id: transactionId, userId: req.user.id } : { id: transactionId }
        })
        if (!result) {
            return res.status(401).json({ message: "Can't delete transaction!" })
        }
        return res.status(401).json({ message: "Successfully deleted transaction!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function getCoffeeVariations(req: Request, res: Response) {
    try {
        const result = await prisma.coffeeVariation.findMany()
        return res.json({ message: "Successfully retrieved coffee variations!", result: result }).status(200)
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", result: null })
    }
}

