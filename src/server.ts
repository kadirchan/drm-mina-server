import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import mongoose from "mongoose";
import { Game, TreeModel, User } from "./schemas.js";
import dotenv from "dotenv";
import { MINA_ADDRESS_REGEX } from "./utils.js";
import { MerkleMap } from "./lib/merkleMap.js";
import { Field, Poseidon, PrivateKey } from "o1js";
import { MerkleTree } from "./lib/merkleTree.js";

dotenv.config();

export async function saveTreeToMongo(map: MerkleMap, name: string) {
    const treeJson = map.tree.toJSON() as {
        height: number;
        nodes: { [key: string]: string };
        name?: string;
    };
    treeJson.name = name;

    await TreeModel.replaceOne({ name: name }, treeJson, { upsert: true });
}

export async function getTreeFromMongo(name: string): Promise<MerkleMap | null> {
    const tree = await TreeModel.findOne({ name: name });
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

        return map;
    } else {
        console.log("No tree found with that name: ", name);
        return null;
    }
}

//@ts-ignore
mongoose.connect(process.env.MONGO);
const mongoDb = mongoose.connection;
mongoDb.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

mongoDb.once("open", function () {
    console.log("Connected successfully to MongoDB");
});

const deviceTree = await getTreeFromMongo("deviceTree");
const sessionTree = await getTreeFromMongo("sessionTree");

const app = express();
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

app.get("/device-tree-leaf/:key", async (req, res) => {
    const { key } = req.params;
    const leaf = deviceTree?.get(Field(key));
    if (leaf) {
        console.log("Device Tree Leaf Sended.");
        res.json(leaf);
    } else {
        res.status(404).send({ message: "Leaf not found" });
    }
});

app.get("/session-tree-leaf/:key", async (req, res) => {
    const { key } = req.params;
    const leaf = sessionTree?.get(Field(key));
    if (leaf) {
        console.log("Session Tree Leaf Sended.");
        res.json(leaf);
    } else {
        res.status(404).send({ message: "Leaf not found" });
    }
});

app.get("/device-tree-witness/:key", async (req, res) => {
    const { key } = req.params;
    const witness = deviceTree?.getWitness(Field(key));
    if (witness) {
        console.log("Device Tree Witness Sended.");
        res.json(witness);
    } else {
        res.status(404).send({ message: "Witness not found" });
    }
});

app.get("/session-tree-witness/:key", async (req, res) => {
    const { key } = req.params;
    const witness = sessionTree?.getWitness(Field(key));
    if (witness) {
        console.log("Session Tree Witness Sended.");
        res.json(witness);
    } else {
        res.status(404).send({ message: "Witness not found" });
    }
});

app.post("/device-tree-leaf", async (req, res) => {
    const { key, value } = req.body;
    deviceTree?.set(Field(key), Field(value));
    // @ts-ignore
    await saveTreeToMongo(deviceTree, "deviceTree");
    console.log("Device Tree Leaf Set.");
    res.status(201).send({ message: "Leaf set" });
});

app.post("/session-tree-leaf", async (req, res) => {
    const { key, value } = req.body;
    sessionTree?.set(Field(key), Field(value));
    // @ts-ignore
    await saveTreeToMongo(sessionTree, "sessionTree");
    console.log("Session Tree Leaf Set.");
    res.status(201).send({ message: "Leaf set" });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
