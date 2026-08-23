import { Request, Response } from "express";
import { prisma } from "../db.js"
import { extractToken, validateUserToken } from "../auth.js";
import { resolveObjectURL } from "node:buffer";
import { resourceUsage } from "node:process";


export async function getBalances(req:Request, res:Response) {
    try {
        const token = await extractToken(req)
        if (!token) {
            return res.json({message:"No token found in cookies, invalid request!",result:null}).status(400)
        }
        const validationResult = await validateUserToken(token,"user")
        if (!validationResult.met || !validationResult.user){
            return res.json({message:"Invalid user token!",result:null}).status(401)
        }
        const pools = await prisma.pool.findMany()
        const resultObject = []
        for (let i=0;i<pools.length;i++){
            const moneyAmount = await prisma.transaction.aggregate({where:{poolId:pools[i].id,userId:validationResult.user.id},_sum:{moneyAmount:true}})
            const coffeeAmount = await prisma.transaction.aggregate({_sum:{coffeeAmount:true}})
            resultObject.push({
                poolId:pools[i].id,
                poolName:pools[i].name,
                moneyBalance:moneyAmount,
                coffeeAmount:coffeeAmount
            })
        }
        return res.json({message:"Successfully retrieved balances!"})
    } catch(e){
        console.log(e)
        return res.json({message:"Internal server error!",result:null}).status(500)
    }
}

export async function getTransactions(req:Request,res:Response) {
    try{
        const token = await extractToken(req)
        if (!token || !req.params.poolId) {
            return res.json({message:"No token found in cookies, invalid request!",result:null}).status(400)
        }
        const validationResult = await validateUserToken(token,"user")
        if (!validationResult.met || !validationResult.user){
            return res.json({message:"Invalid user token!",result:null}).status(401)
        }
        const poolId = typeof(req.params.poolId) === "string" ? req.params.poolId : req.params.poolId[0]
        const transactions = await prisma.transaction.findMany({where:{userId:validationResult.user.id, poolId:req.params.poolId}})
    } catch(e){
        console.log(e)
        return res.json({message:"Internal server error!",result:null})
    }
}