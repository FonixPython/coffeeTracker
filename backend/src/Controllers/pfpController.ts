import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path"
import sharp from "sharp"
import fs from "fs/promises";


const storage = multer.diskStorage({
    destination: process.env.UPLOAD_PATH || "./uploads",
    filename: function (req: Request & Record<string, any>, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const ext = path.extname(file.originalname);
        const filename = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${ext}`;
        cb(null, filename);
    },
});


export const uploadMiddleware = (req: Request & Record<string, any>, res: Response, next: NextFunction) => {
    const limits = {} as { [key: string]: any };
    limits.fileSize = 1024 * 10;
    const allowedMime: string[] = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/bmp", "image/avif", "image/gif", "image/webp"]

    const upload = multer({
        storage: storage,
        limits: limits,
        fileFilter: function (req, file, cb) {
            if (!allowedMime.includes(file.mimetype)) {
                return cb(new Error('Wrong file type'));
            }
            cb(null, true)
        }
    }).single("file");


    upload(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(413).json({
                        message: "File too large!"
                    });
                }
            } else if (err instanceof Error) {
                if (err.message === "Wrong file type") {
                    return res.status(415).json({
                        message: "Unsupported file type!"
                    });
                }
            }
            return next(err);
        }
        next();
    });
};


export async function uploadProfilePicture(req: Request & Record<string, any>, res: Response) {
    if (!req.file) { return res.status(400).json({ message: "No file provided" }) }
    try {
        const originaImageFilePath = path.join(process.env.UPLOAD_PATH || 'pfpUploads', req.file.filename)
        const newImageFilePath = path.join(process.env.UPLOAD_PATH || 'pfpUploads', `${(req.user.permission == "admin" && req.body.id) ? req.body.id : req.user.id}.webp`)
        await sharp(originaImageFilePath).resize({ height: 600 }).webp({ quality: 60 }).toFile(newImageFilePath)
        await fs.unlink(originaImageFilePath);
        return res.json({ message: "Successfully uploaded and processed profile picture!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function deleteProfilePictre(req: Request & Record<string, any>, res: Response) {
    if (!req.params.userId) {
        return res.status(400).json({ message: "Invalid request!" })
    }
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
    const filePath = path.resolve(process.env.UPLOAD_PATH || 'pfpUploads', userId + ".webp")
    if (req.user.permission != "admin" && userId != req.user.id) {
        return res.status(401).json({ message: "Unauthorized to delete the profile picture!" })
    }
    try {
        fs.unlink(filePath)
        return res.json({ message: "Successfully deleted profile picture!" })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export async function getProfilePicture(req: Request & Record<string, any>, res: Response) {
    if (!req.params.userId) {
        return res.status(400).json({ message: "Invalid request!" })
    }
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
    const filePath = path.resolve(process.env.UPLOAD_PATH || 'pfpUploads', userId + ".webp")
    try {
        await fs.stat(filePath);
        return res.sendFile(filePath);
    } catch (err: any) {
        console.log(err)
        return res.sendFile(path.resolve("dist", "public", "defaultProfile.webp"));
    }
}