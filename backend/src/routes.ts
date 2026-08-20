import express from 'express';
import { Request, Response } from 'express';

export const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    res.sendFile("public/index.html");
})