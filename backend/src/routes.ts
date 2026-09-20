import express from 'express';
import { Request, Response } from 'express';
import { login, register, logout, checkAuth, deleteUser, editUser, changePassword } from './Controllers/userController.js';
import { addTransaction, deleteTransaction, editTransaction, getBalances, getCoffeeCost, getCoffeeVariations, getTransactions } from './Controllers/userActionController.js';
import { authenticateAdmin, authenticateUser } from './auth.js';
import { addPool, addVariation, deletePool, deleteSpecifiedUser, deleteVariation, editPool, editVariation, getAllUsers, getBalancesForSpecificUser, getPools } from './Controllers/adminActionController.js';
import { deleteProfilePictre, getProfilePicture, uploadMiddleware, uploadProfilePicture } from './Controllers/pfpController.js';

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
router.post("/api/editUser", authenticateUser, editUser)
router.get("/api/verify", authenticateUser, checkAuth)

// Actions for users

router.get("/api/getBalances", authenticateUser, getBalances)
router.get("/api/getTransactions/:poolId", authenticateUser, getTransactions)
router.get("/api/getVariations", authenticateUser, getCoffeeVariations)
router.post("/api/addTransaction", authenticateUser, addTransaction)
router.post("/api/editTransaction/:transactionId", authenticateUser, editTransaction)
router.delete("/api/deleteTransaction/:transactionId", authenticateUser, deleteTransaction)
router.get("/api/coffeeCost/:poolId", authenticateUser, getCoffeeCost)

// Profile picture actions

router.get("/api/getProfilePicture/:userId", authenticateUser, getProfilePicture)
router.delete("/api/deleteProfilePicture/:userId", authenticateUser, deleteProfilePictre)
router.post("/api/uploadProfilePicture", authenticateUser, uploadMiddleware, uploadProfilePicture)

// Actions for admin
router.get("/api/getAllUsers", authenticateAdmin, getAllUsers)
router.delete("/api/deleteSpecifiedUser/:userId", authenticateAdmin, deleteSpecifiedUser)
router.get("/api/getBalancesForUser/:userId", authenticateAdmin, getBalancesForSpecificUser)

router.get("/api/getPools", authenticateAdmin, getPools)
router.post("/api/addPool", authenticateAdmin, addPool)
router.post("/api/editPool/:poolId", authenticateAdmin, editPool)
router.delete("/api/deletePool/:poolId", authenticateAdmin, deletePool)

router.post("/api/addVariation", authenticateAdmin, addVariation)
router.post("/api/editVariation", authenticateAdmin, editVariation)
router.delete("/api/deleteVariation/:variationId", authenticateAdmin, deleteVariation)