import mongoose from "mongoose";

const Schema = mongoose.Schema;

const gameSchema = new mongoose.Schema(
    {
        gameId: { type: Number, index: true },
        name: String,
        description: String,
        creator: String,
        cover: String,
        price: Number,
        discount: Number,
        rating: Number,
        releaseDate: String,
        tags: [String],
    },
    { versionKey: false }
);

const UserSchema = new Schema(
    {
        publicKey: {
            type: String,
            unique: true,
            required: true,
        },
        wishlistedGames: [Number],
    },
    { versionKey: false }
);

export const User = mongoose.model("User", UserSchema);
export const Game = mongoose.model("Game", gameSchema);
