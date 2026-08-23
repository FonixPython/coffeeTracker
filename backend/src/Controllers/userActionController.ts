import { Request, Response } from "express";
import { prisma } from "../db.js"
import { extractToken, validateUserToken } from "../auth.js";

export async function getBalances(req: Request, res: Response) {
    try {
        const token = await extractToken(req)
        if (!token) {
            return res.json({ message: "No token found in cookies, invalid request!", result: null }).status(400)
        }
        const validationResult = await validateUserToken(token, "user")
        if (!validationResult.met || !validationResult.user) {
            return res.json({ message: "Invalid user token!", result: null }).status(401)
        }
        const pools = await prisma.pool.findMany()
        const resultObject = []
        for (let i = 0; i < pools.length; i++) {
            const moneyAmount = await prisma.transaction.aggregate({ where: { poolId: pools[i].id, userId: validationResult.user.id }, _sum: { moneyAmount: true } })
            const coffeeAmount = await prisma.transaction.aggregate({ _sum: { coffeeAmount: true } })
            resultObject.push({
                poolId: pools[i].id,
                poolName: pools[i].name,
                moneyBalance: moneyAmount._sum,
                coffeeAmount: coffeeAmount._sum
            })
        }
        return res.json({ message: "Successfully retrieved balances!" })
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!", result: null }).status(500)
    }
}

export async function getTransactions(req: Request, res: Response) {
    try {
        const token = await extractToken(req)
        if (!token || !req.params.poolId) {
            return res.json({ message: "Invalid request!", result: null }).status(400)
        }
        const validationResult = await validateUserToken(token, "user")
        if (!validationResult.met || !validationResult.user) {
            return res.json({ message: "Invalid user token!", result: null }).status(401)
        }
        const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId;
        const transactions = await prisma.transaction.findMany({ where: { userId: validationResult.user.id, poolId: poolId } })
        const currentTime = Date.now()
        const returnArray = []
        for (let i = 0; i < transactions.length; i++) {
            returnArray.push({
                ...transactions[i],
                edit: currentTime - transactions[i].dateOfTransaction.getTime() < 1000 * 60 * 60
            })
        }
        return res.json({ message: "Successfully retrieved transactions!", result: transactions }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!", result: null })
    }
}

async function calculateCoffeeCost(poolId: string): Promise<number | null> {
    try {
        const poolData = await prisma.transaction.aggregate({ where: { poolId: poolId, type: { in: ["drink", "addCoffee"] } }, _sum: { coffeeAmount: true, moneyAmount: true } })
        if (!poolData._sum.moneyAmount || !poolData._sum.coffeeAmount) {
            return null
        }
        return poolData._sum.moneyAmount / poolData._sum.coffeeAmount
    } catch (e) {
        console.log(e)
        throw e
    }
}

export async function addTransaction(req: Request, res: Response) {
    try {
        const token = await extractToken(req)
        if (!token || !req.body.poolId || !req.body.moneyAmount || !req.body.coffeeAmount || !req.body.type || !req.body.coffeeVariation) {
            return res.json({ message: "Invalid request!", result: null }).status(400)
        }
        const validationResult = await validateUserToken(token, "user")
        if (!validationResult.met || !validationResult.user) {
            return res.json({ message: "Invalid user token!", result: null }).status(401)
        }
        const data = {
            coffeeAmount: req.body.coffeeAmount,
            moneyAmount: req.body.moneyAmount
        }
        switch (req.body.type) {
            case "drink":
                const coffeeCost = await calculateCoffeeCost(req.body.poolId)
                if (!coffeeCost) {
                    return res.json({ message: "No coffee" }).status(500)
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
                return res.json({ message: "Invalid transaction type!" }).status(400)
        }
        const result = await prisma.transaction.create({
            data: {
                userId: validationResult.user.id,
                poolId: req.body.poolId,
                type: req.body.type,
                moneyAmount: data.moneyAmount,
                coffeeAmount: data.coffeeAmount,
                coffeeVariationId: req.body.coffeeVariation
            }
        })
        if (!result) {
            return res.json({ message: "Internal server error!" }).status(500)
        } else {
            return res.json({ message: "Successfully added transaction!" }).status(200)
        }

    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function editTransaction(req: Request, res: Response) {
    try {
        const token = await extractToken(req)
        if (!token || !req.params.transactionId || !req.body.moneyAmount || !req.body.coffeeAmount || !req.body.type || !req.body.coffeeVariation) {
            return res.json({ message: "Invalid request!", result: null }).status(400)
        }
        const validationResult = await validateUserToken(token, "user")
        if (!validationResult.met || !validationResult.user) {
            return res.json({ message: "Invalid user token!", result: null }).status(401)
        }
        const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
        const data = {
            coffeeAmount: req.body.coffeeAmount,
            moneyAmount: req.body.moneyAmount
        }
        const before = await prisma.transaction.findFirstOrThrow({ where: { id: transactionId } })
        switch (req.body.type) {
            case "drink":
                const coffeeCost = await calculateCoffeeCost(before.poolId)
                if (!coffeeCost) {
                    return res.json({ message: "No coffee" }).status(500)
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
                return res.json({ message: "Invalid transaction type!" }).status(400)
        }
        if (validationResult.user.permission == "user" && Date.now() - before.dateOfTransaction.getTime() < 1000 * 60 * 60) {
            return res.json({ message: "Transaction too old to edit!" }).status(401)
        }

        const result = await prisma.transaction.update({
            where: (validationResult.user.permission == "user") ? { id: transactionId, userId: validationResult.user.id } : { id: transactionId },
            data: {
                type: req.body.type,
                coffeeAmount: data.coffeeAmount,
                moneyAmount: data.moneyAmount,
                coffeevariation: req.body.coffeeVariation
            }
        })
        if (!result) {
            return res.json({ message: "Can't edit transaction!" }).status(401)
        }
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function deleteTransaction(req: Request, res: Response) {
    try {
        const token = await extractToken(req)
        if (!token || !req.params.transactionId) {
            return res.json({ message: "Invalid request!", result: null }).status(400)
        }
        const validationResult = await validateUserToken(token, "user")
        if (!validationResult.met || !validationResult.user) {
            return res.json({ message: "Invalid user token!", result: null }).status(401)
        }
        const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
        const result = await prisma.transaction.delete({
            where: validationResult.user.permission == "user" ? { id: transactionId, userId: validationResult.user.id } : { id: transactionId }
        })
        if (!result) {
            return res.json({ message: "Can't delete transaction!" }).status(401)
        }
        return res.json({ message: "Successfully deleted transaction!" }).status(401)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!" }).status(500)
    }
}

export async function getCoffeeVariations(req: Request, res: Response) {
    try {
        const token = await extractToken(req)
        if (!token || !req.params.poolId) {
            return res.json({ message: "Invalid request!", result: null }).status(400)
        }
        const validationResult = await validateUserToken(token, "user")
        if (!validationResult.met || !validationResult.user) {
            return res.json({ message: "Invalid user token!", result: null }).status(401)
        }
        const result = await prisma.coffeeVariation.findMany()
        return res.json({ message: "Successfully retrieved coffee variations!", result: result }).status(200)
    } catch (e) {
        console.log(e)
        return res.json({ message: "Internal server error!", result: null }).status(500)
    }
}

