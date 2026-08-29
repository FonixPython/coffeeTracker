import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import os from "os"
import path from "node:path";
import { fileURLToPath } from "node:url";
import { router } from "./routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", router)


function getIPv4Addresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        const networkInterface = interfaces[name];
        if (networkInterface) {
            for (const inter of networkInterface) {
                if (inter.family === "IPv4" && !inter.internal) {
                    addresses.push(inter.address);
                }
            }
        }
    }
    return addresses;
}

app.listen(PORT, () => {
    console.log("Server is Running");
    console.log(`http://localhost:${PORT}`);

    const ipAddresses = getIPv4Addresses();
    ipAddresses.forEach((ip: string) => {
        console.log(`http://${ip}:${PORT}`);
    });
});