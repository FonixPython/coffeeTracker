import express from 'express';
import { Request, Response } from 'express';
import { login, register, logout, checkAuth, deleteUser, editUser, changePassword } from './Controllers/userController.js';
import { addTransaction, deleteTransaction, editTransaction, getBalances, getCoffeeVariations, getTransactions } from './Controllers/userActionController.js';
import { authenticateAdmin, authenticateUser } from './auth.js';
import { addPool, addVariation, deletePool, deleteVariation, editPool, editVariation, getAllUsers, getPools } from './Controllers/adminActionController.js';

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    res.sendFile("public/index.html");
})

// Authentication endpoints

router.post("/api/login", login)
router.post("/api/register", register)
router.get("/api/logout", authenticateUser, logout)
router.delete("/api/deleteUser", authenticateUser, deleteUser)
router.post("/api/changePassword", authenticateUser, changePassword)
router.get("/api/editUser", authenticateUser, editUser)
router.get("/api/verify", authenticateUser, checkAuth)

// Actions for users

router.get("/api/getBalances", authenticateUser, getBalances)
router.get("/api/getTransactions/:poolId", authenticateAdmin, getTransactions)
router.get("/api/getVariations", authenticateUser, getCoffeeVariations)
router.post("/api/addTranaction", authenticateUser, addTransaction)
router.post("/api/editTransaction/:transactionId", authenticateUser, editTransaction)
router.delete("/api/deleteTransaction/:transactionId", authenticateUser, deleteTransaction)

// Actions for admin
router.get("/api/getAllUsers", authenticateAdmin, getAllUsers)


router.get("/api/getPools", authenticateAdmin, getPools)
router.post("/api/addPool", authenticateAdmin, addPool)
router.post("/api/editPool/:poolId", authenticateAdmin, editPool)
router.delete("/api/deletePool/:poolId", authenticateAdmin, deletePool)

router.post("/api/addVariation", authenticateAdmin, addVariation)
router.post("/api/editVariation", authenticateAdmin, editVariation)
router.delete("/api/deleteVariation/:variationId", authenticateAdmin, deleteVariation)