import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import Database from "./database.js";

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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
