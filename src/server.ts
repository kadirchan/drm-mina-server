import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import Database from "./database.js";
import mongoose from "mongoose";
import { Game, User } from "./schemas.js";
import dotenv from "dotenv";
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
    console.log("received");
    res.setHeader("Content-Type", "application/json");
    const games = await Game.find({});
    console.log(games);
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
                res.status(201).send("Game removed from wishlist");
            } else {
                await User.updateOne({ publicKey }, { $addToSet: { wishlistedGames: gameId } });
                res.status(202).send("Game added to wishlist");
            }
        } else {
            res.status(401).send("User not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error when adding game to wishlist");
    }
});

app.get("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;

    try {
        const user = await User.findOne({ publicKey });
        console.log(user?.wishlistedGames);
        res.json(user ? user.wishlistedGames : []);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving wishlist");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
