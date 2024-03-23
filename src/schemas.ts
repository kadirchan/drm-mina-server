import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    title: String,
    gameId: Number,
    tokenId: Number,
});

const UserSchema = new Schema({
    publicKey: {
        type: String,
        unique: true,
        required: true,
    },
    wishlistedGames: [GameSchema],
});

export const User = mongoose.model("User", UserSchema);
