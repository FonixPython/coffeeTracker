import { Request, Response } from "express";
import { prisma } from "../db.js"

export async function getBalances(req: Request & Record<string, any>, res: Response) {
    try {
        const pools = await prisma.pool.findMany()
        const resultObject = []
        for (let i = 0; i < pools.length; i++) {
            const moneyAmount = await prisma.transaction.aggregate({ where: { poolId: pools[i].id, userId: req.user.id, type: { not: "globalTransaction" } }, _sum: { moneyAmount: true } })
            const coffeeAmount = await prisma.transaction.aggregate({ where: { poolId: pools[i].id }, _sum: { coffeeAmount: true } })
            const poolMoneyOnly = await prisma.transaction.aggregate({ where: { poolId: pools[i].id, type: { in: ["useUpMoney", "addMoney"] } }, _sum: { moneyAmount: true } })
            const globallyAdded = await prisma.transaction.aggregate({ where: { poolId: pools[i].id, type: "addMoney", companyTransactionId: { not: null } }, _sum: { moneyAmount: true } })
            resultObject.push({
                poolId: pools[i].id,
                poolName: pools[i].name,
                moneyBalance: Number(moneyAmount._sum.moneyAmount),
                coffeeAmount: Number(coffeeAmount._sum.coffeeAmount),
                poolMoneyOnly: Number(poolMoneyOnly._sum.moneyAmount) - Number(globallyAdded._sum.moneyAmount)
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
        const transactions = await prisma.transaction.findMany({ where: { userId: req.user.id, poolId: poolId, type: { notIn: ["useUpMoney", "globalTransaction"] } }, orderBy: { dateOfTransaction: "desc" } })
        const currentTime = Date.now()
        const returnArray = []
        for (let i = 0; i < transactions.length; i++) {
            returnArray.push({
                ...transactions[i],
                edit: (transactions[i].type == "addMoney" && transactions[i].companyTransactionId != null) ? false : currentTime - transactions[i].dateOfTransaction.getTime() < 1000 * 60 * 60
            })
        }
        return res.json({ message: "Successfully retrieved transactions!", result: returnArray || [] }).status(200)
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!", result: [] })
    }
}

export async function calculateCoffeeCost(poolId: string): Promise<number | null> {
    try {
        const poolData = await prisma.transaction.aggregate({ where: { poolId: poolId, type: { in: ["drink", "addCoffee", "useMoney", "globalTransaction"] } }, _sum: { coffeeAmount: true, moneyAmount: true } })
        if (!poolData._sum.moneyAmount || !poolData._sum.coffeeAmount) {
            return null
        }
        return poolData._sum.moneyAmount / poolData._sum.coffeeAmount
    } catch (e) {
        console.log(e)
        throw e
    }
}

export async function getCoffeeCost(req: Request, res: Response) {
    const poolId = Array.isArray(req.params.poolId) ? req.params.poolId[0] : req.params.poolId
    try {
        const cost = await calculateCoffeeCost(poolId)
        return res.json({ message: "Successfully retrieved coffeeCost for pool!", result: cost })
    } catch (e) {
        return res.status(500).json({ message: "Internal server error!", result: [] })
    }

}

export async function addTransaction(req: Request & Record<string, any>, res: Response) {
    try {
        if (!req.body.poolId == undefined || req.body.moneyAmount == undefined || !req.body.coffeeAmount == undefined || !req.body.type == undefined) {
            return res.status(400).json({ message: "Invalid request!", result: null })
        }
        interface DataInterface {
            coffeeAmount: number,
            moneyAmount: number,
            companyTransactionId: string | null
        }
        const data: DataInterface = {
            coffeeAmount: req.body.coffeeAmount,
            moneyAmount: req.body.moneyAmount,
            companyTransactionId: null
        }
        switch (req.body.type) {
            case "drink":
                if (!req.body.coffeeVariation == undefined) {
                    return res.status(400).json({ message: "Invalid request!", result: null })
                }
                const coffeeCost = await calculateCoffeeCost(req.body.poolId)
                if (!coffeeCost) {
                    return res.status(500).json({ message: "No coffee" })
                }

                const poolCoffeeAmount = await prisma.transaction.aggregate({ where: { poolId: req.body.poolId, type: { in: ["drink", "addCoffee", "useMoney"] } }, _sum: { coffeeAmount: true } })
                const userMoneyAmount = await prisma.transaction.aggregate({ where: { poolId: req.body.poolId, userId: req.user.id }, _sum: { moneyAmount: true } })
                if (req.body.coffeeVariation != null) {
                    const variation = await prisma.coffeeVariation.findFirstOrThrow({ where: { id: req.body.coffeeVariation } })
                    data.coffeeAmount = variation.coffeeAmount * -1
                    data.moneyAmount = variation.coffeeAmount * Number(coffeeCost) * -1
                } else {
                    data.coffeeAmount = (Math.abs(data.coffeeAmount)) * -1
                    data.moneyAmount = data.coffeeAmount * Number(coffeeCost)
                }
                let hasEnoughCoffee = data.coffeeAmount <= Number(poolCoffeeAmount._sum.coffeeAmount)
                let hasEnoughMoney = Math.ceil(Number(coffeeCost) * data.coffeeAmount) <= Number(userMoneyAmount._sum.moneyAmount)
                if (!hasEnoughCoffee) {
                    return res.status(400).json({ message: "Not enough coffee!" })
                }
                /* People can go now into the negatives, idk why, but sure
                if (!hasEnoughMoney) {
                    return res.status(400).json({ message: "Not enough money!" })
                }
                */
                break
            case "addCoffee":
                data.coffeeAmount = data.coffeeAmount > 0 ? data.coffeeAmount : data.coffeeAmount * -1
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                break
            case "addMoney":
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                data.coffeeAmount = 0
                break
            case "useMoney":
                const poolMoney = await prisma.transaction.aggregate({ where: { poolId: req.body.poolId, type: { in: ["addMoney", "useUpMoney"] } }, _sum: { moneyAmount: true } })
                if (Number(poolMoney._sum.moneyAmount) < data.moneyAmount) {
                    return res.status(400).json({ message: "Pool doesn't have enough funds!!" })
                }
                const companyTransaction = await prisma.transaction.create({
                    data: {
                        userId: req.user.id,
                        poolId: req.body.poolId,
                        type: "useUpMoney",
                        moneyAmount: Math.abs(data.moneyAmount) * -1,
                        coffeeAmount: 0
                    }
                })
                data.companyTransactionId = companyTransaction.id
                data.moneyAmount = Math.abs(data.moneyAmount)
                data.coffeeAmount = Math.abs(data.coffeeAmount)
                break
            case "globalTransaction":
                if (req.user.permission != "admin") {
                    return res.status(403).json({ message: "Unauthorized for this transaction!" })
                }
                const globalResult = await prisma.transaction.create({
                    data: {
                        userId: req.user.id,
                        poolId: req.body.poolId,
                        type: req.body.type,
                        moneyAmount: req.body.moneyAmount,
                        coffeeAmount: req.body.coffeeAmount
                    }
                })
                if (!globalResult) {
                    return res.status(500).json({ message: "Internal server error!" })
                }
                const users = await prisma.user.findMany()
                let manyData = []
                for (let i = 0; i < users.length; i++) {
                    manyData.push({
                        companyTransactionId: globalResult.id,
                        userId: users[i].id,
                        poolId: req.body.poolId,
                        type: "addMoney",
                        moneyAmount: Math.floor(req.body.moneyAmount / users.length),
                        coffeeAmount: 0
                    })
                }
                const createManyResult = await prisma.transaction.createManyAndReturn({ data: manyData })
                if (!createManyResult) {
                    await prisma.transaction.delete({ where: { id: globalResult.id } })
                    return res.status(500).json({ message: "Internal server error!" })
                }
                return res.json({ message: "Successfully added global transaction!" })
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
                coffeeVariationId: req.body.coffeeVariation ? req.body.coffeeVariation : null,
                companyTransactionId: data.companyTransactionId
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
        if (!req.body.poolId == undefined || req.body.moneyAmount == undefined || !req.body.coffeeAmount == undefined || !req.body.type == undefined) {
            return res.status(400).json({ message: "Invalid request!", result: null })
        }
        const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
        const data = {
            coffeeAmount: req.body.coffeeAmount,
            moneyAmount: req.body.moneyAmount
        }
        const before = await prisma.transaction.findFirstOrThrow({ where: { id: transactionId } })
        switch (before.type) {
            case "drink":
                if (!req.body.coffeeVariation == undefined) {
                    return res.status(400).json({ message: "Invalid request!", result: null })
                }
                const coffeeCost = await calculateCoffeeCost(req.body.poolId)
                if (!coffeeCost) {
                    return res.status(500).json({ message: "No coffee" })
                }

                const poolCoffeeAmount = await prisma.transaction.aggregate({ where: { poolId: req.body.poolId, type: { in: ["drink", "addCoffee", "useMoney"] } }, _sum: { coffeeAmount: true } })
                const userMoneyAmount = await prisma.transaction.aggregate({ where: { poolId: req.body.poolId, userId: req.user.id }, _sum: { moneyAmount: true } })
                if (req.body.coffeeVariation != null) {
                    const variation = await prisma.coffeeVariation.findFirstOrThrow({ where: { id: req.body.coffeeVariation } })
                    data.coffeeAmount = variation.coffeeAmount * -1
                    data.moneyAmount = variation.coffeeAmount * Number(coffeeCost) * -1
                } else {
                    data.coffeeAmount = (Math.abs(data.coffeeAmount)) * -1
                    data.moneyAmount = data.coffeeAmount * Number(coffeeCost)
                }
                let hasEnoughCoffee = req.body.poolId == before.poolId ? (data.coffeeAmount <= Number(poolCoffeeAmount._sum.coffeeAmount) + before.coffeeAmount) : (data.coffeeAmount <= Number(poolCoffeeAmount._sum.coffeeAmount))
                let hasEnoughMoney = req.body.poolID == before.poolId ? (Math.ceil(Number(coffeeCost) * data.coffeeAmount) <= Number(userMoneyAmount._sum.moneyAmount) + before.moneyAmount) : (Math.ceil(Number(coffeeCost) * data.coffeeAmount) <= Number(userMoneyAmount._sum.moneyAmount))
                if (!hasEnoughCoffee) {
                    return res.status(400).json({ message: "Not enough coffee!" })
                }
                /* Again, client requested the ability for people to go into the negatives
                if (!hasEnoughMoney) {
                    return res.status(400).json({ message: "Not enough money!" })
                }
                */
                break
            case "addCoffee":
                data.coffeeAmount = data.coffeeAmount > 0 ? data.coffeeAmount : data.coffeeAmount * -1
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                break
            case "addMoney":
                data.moneyAmount = data.moneyAmount > 0 ? data.moneyAmount : data.moneyAmount * -1
                data.coffeeAmount = 0
                break
            case "useMoney":
                const poolMoney = await prisma.transaction.aggregate({ where: { poolId: req.body.poolId, type: { in: ["addMoney", "useUpMoney"] } }, _sum: { moneyAmount: true } })
                if (req.body.poolId == before.poolId ? (Number(poolMoney._sum.moneyAmount) + before.moneyAmount < data.moneyAmount) : (Number(poolMoney._sum.moneyAmount) < data.moneyAmount)) {
                    return res.status(400).json({ message: "Pool doesn't have enough funds!!" })
                }
                await prisma.transaction.update({
                    where: { id: before.companyTransactionId || "" },
                    data: {
                        poolId: req.body.poolId,
                        type: "useUpMoney",
                        moneyAmount: Math.abs(data.moneyAmount) * -1,
                        coffeeAmount: 0
                    }
                })
                data.moneyAmount = Math.abs(data.moneyAmount)
                data.coffeeAmount = Math.abs(data.coffeeAmount)
                break
            case "globalTransaction":
                if (req.user.permission != "admin") {
                    return res.status(403).json({ message: "Unauthorized for this transaction!" })
                }
                const companyTransactionsCount = await prisma.transaction.count({ where: { companyTransactionId: transactionId, type: "addMoney" } })
                const updateManyResult = await prisma.transaction.updateManyAndReturn({ where: { companyTransactionId: transactionId }, data: { moneyAmount: Math.floor(data.moneyAmount / companyTransactionsCount) } })
                if (!updateManyResult) {
                    return res.status(500).json({ message: "Internal server error!" })
                }
                break
            default:
                return res.status(400).json({ message: "Invalid transaction type!" })
        }
        if (req.user.permission == "user" && Date.now() - before.dateOfTransaction.getTime() > 1000 * 60 * 60) {
            return res.status(401).json({ message: "Transaction too old to edit!" })
        }

        const result = await prisma.transaction.update({
            where: (req.user.permission == "user") ? { id: transactionId, userId: req.user.id } : { id: transactionId },
            data: {
                poolId: req.body.poolId,
                moneyAmount: data.moneyAmount,
                coffeeAmount: data.coffeeAmount,
                coffeeVariationId: req.body.coffeeVariation ? req.body.coffeeVariation : null,
            }
        })
        if (!result) {
            return res.status(401).json({ message: "Can't edit transaction!" })
        }
        return res.json({ message: "Successfully edited transaction!" })
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
        const before = await prisma.transaction.findFirstOrThrow({ where: { id: transactionId } })
        if (req.user.permission == "user" && Date.now() - before.dateOfTransaction.getTime() > 1000 * 60 * 60) {
            return res.status(401).json({ message: "Transaction too old to delete!" })
        }
        if (before?.companyTransactionId && before.type != "addMoney") {
            await prisma.transaction.delete({
                where: req.user.permission == "user" ? { id: before.companyTransactionId, userId: req.user.id } : { id: before?.companyTransactionId }
            })
        } else if (before.type == "globalTransaction") {
            await prisma.transaction.deleteMany({ where: { companyTransactionId: transactionId, type: "addMoney" } })
        }
        if (before?.companyTransactionId && before.type == "addMoney") {
            return res.status(403).json({ message: "You can't delete this transaction!" })
        }
        const result = await prisma.transaction.delete({
            where: req.user.permission == "user" ? { id: transactionId, userId: req.user.id } : { id: transactionId }
        })
        if (!result) {
            return res.status(401).json({ message: "Can't delete transaction!" })
        }
        return res.json({ message: "Successfully deleted transaction!" })
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

