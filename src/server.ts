import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import Database from "./database.js";
import mongoose from "mongoose";
import { Game, TreeModel, User } from "./schemas.js";
import dotenv from "dotenv";
import { MINA_ADDRESS_REGEX } from "./utils.js";
import { MerkleMap } from "./lib/merkleMap.js";
import { Field, Poseidon, PrivateKey } from "o1js";
import { MerkleTree } from "./lib/merkleTree.js";

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

const publicKey = PrivateKey.random().toPublicKey();
await (async () => {
    const map = new MerkleMap();
    map.set(Poseidon.hash(publicKey.toFields()), Field(31));
    console.log("Merkle Root", map.getRoot().toString());
    console.log("Leaf", map.get(Poseidon.hash(publicKey.toFields())).toString());

    const map2 = new MerkleMap();
    map2.tree = MerkleTree.fromJSON(map.tree.toJSON());
    console.log("Merkle Root", map2.getRoot().toString());
    console.log("Leaf", map2.get(Poseidon.hash(publicKey.toFields())).toString());

    const treeJson = map.tree.toJSON() as {
        height: number;
        nodes: { [key: string]: string };
        name?: string;
    };
    treeJson.name = "merkleMap";

    await TreeModel.replaceOne(
        { name: "merkleMap" }, // Filter
        treeJson, // Replacement document
        { upsert: true } // Options
    );
})();

await (async () => {
    const tree = await TreeModel.findOne({ name: "merkleMap" });
    if (tree) {
        const treeObject = tree.toObject();
        // @ts-ignore
        delete treeObject._id;
        delete treeObject.name;
        const treeJson = treeObject as {
            height: number;
            nodes: { [key: string]: string };
        };
        const map = new MerkleMap();
        map.tree = MerkleTree.fromJSON(treeJson);

        console.log("Merkle Root", map.getRoot().toString());
        console.log("Leaf", map.get(Poseidon.hash(publicKey.toFields())).toString());
    } else {
        console.log("No tree found with that name");
    }
})();

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
