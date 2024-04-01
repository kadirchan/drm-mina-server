import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import Database from "./database.js";
import mongoose from "mongoose";
import { Game, User } from "./schemas.js";
import dotenv from "dotenv";
import { MINA_ADDRESS_REGEX } from "./utils.js";

dotenv.config();

//@ts-ignore
mongoose.connect(process.env.MONGO);
const mongoDb = mongoose.connection;
mongoDb.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

mongoDb.once("open", function () {
    console.log("Connected successfully to MongoDB");
});

const app = express();
const db = new Database();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(serveStatic("public"));

app.get("/game-data", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const games = await Game.find({});
    console.log("Game Data Sended.");
    res.json(games);
});

app.post("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;
    const { gameId } = req.body;

    try {
        const user = await User.findOne({ publicKey });

        if (user) {
            if (user.wishlistedGames.includes(gameId)) {
                await User.updateOne({ publicKey }, { $pull: { wishlistedGames: gameId } });
                res.status(201).send({ message: "Game removed from wishlist" });
                console.log("Game " + gameId + " removed from wishlist user" + publicKey + ".");
            } else {
                await User.updateOne({ publicKey }, { $addToSet: { wishlistedGames: gameId } });
                res.status(202).send({ message: "Game added to wishlist" });
                console.log("Game " + gameId + " added to wishlist user" + publicKey + ".");
            }
        } else {
            if (MINA_ADDRESS_REGEX.test(publicKey)) {
                await User.create({ publicKey, wishlistedGames: [gameId] });
                res.status(201).send({ message: "Game added to wishlist" });
                console.log("Game " + gameId + " added to wishlist user" + publicKey + ".");
            } else {
                res.status(405).send({ message: "Invalid public key" });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(501).send({ message: "Error when adding game to wishlist" });
    }
});

app.get("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;

    try {
        const user = await User.findOne({ publicKey });
        console.log("Wishlist Sended user" + publicKey + ".");
        res.json(user ? user.wishlistedGames : []);
    } catch (err) {
        console.error(err);
        res.status(502).send({ message: "Error retrieving wishlist" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
