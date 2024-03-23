import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import Database from "./database.js";
import mongoose from "mongoose";
import { User } from "./schemas.js";

// mongoose.connect("mongodb://localhost:27017/yourDatabaseName");
// mongoose.connection.on("error", (err) => {
//     console.error("MongoDB connection error:", err);
// });

const app = express();
const db = new Database();
const port = 8080;

app.use(cors());
app.use(serveStatic("public"));

app.get("/game-data", (req, res) => {
    console.log("received");
    res.setHeader("Content-Type", "application/json");
    res.send(db.games);
});

app.post("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;
    const { game } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { publicKey },
            { $push: { wishlistedGames: game } },
            { new: true, upsert: true }
        );
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error when adding game to wishlist");
    }
});

app.get("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;

    try {
        const user = await User.findOne({ publicKey });
        res.json(user?.wishlistedGames || []);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving wishlist");
    }
});

app.delete("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;
    const { gameId } = req.body;

    try {
        const user = await User.findOne({ publicKey });
        if (!user) {
            return res.status(404).send("User not found");
        }

        user.wishlistedGames.pull({ gameId });
        await user.save();

        res.json(user.wishlistedGames);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error removing game from wishlist");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
