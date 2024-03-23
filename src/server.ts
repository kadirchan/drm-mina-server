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
app.use(express.json());
app.use(serveStatic("public"));

app.get("/game-data", (req, res) => {
    console.log("received");
    res.setHeader("Content-Type", "application/json");
    res.send(db.games);
});

app.post("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;
    const { gameId } = req.body;

    try {
        // const user = await User.findOneAndUpdate(
        //     { publicKey },
        //     { $push: { wishlistedGames: game } },
        //     { new: true, upsert: true }
        // );
        const user = publicKey;
        console.log("Adding game to wishlist", user, gameId);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error when adding game to wishlist");
    }
});

app.get("/wishlist/:publicKey", async (req, res) => {
    const { publicKey } = req.params;

    try {
        // const user = await User.findOne({ publicKey });
        // res.json(user?.wishlistedGames || []);
        const user = publicKey;
        console.log("Retrieving wishlist", user);
        res.json([]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving wishlist");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
