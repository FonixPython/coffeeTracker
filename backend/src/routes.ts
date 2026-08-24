import express from 'express';
import { Request, Response } from 'express';
import { login, register, logout, checkAuth } from './Controllers/userController.js';
import { addTransaction, deleteTransaction, editTransaction, getBalances, getCoffeeVariations, getTransactions } from './Controllers/userActionController.js';

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    res.sendFile("public/index.html");
})

// Authentication endpoints

router.post("/login", login)
router.post("/register", register)
router.get("/logout", logout)
router.get("/verify", checkAuth)

// Actions for users

router.get("/api/getBalances", getBalances)
router.get("/api/getTransactions/:poolId", getTransactions)
router.get("/api/getVariations", getCoffeeVariations)
router.post("/api/addTranaction", addTransaction)
router.post("/api/editTransaction/:transactionId", editTransaction)
router.get("/api/deleteTransaction/:transactionId", deleteTransaction)

// Actions for admin

