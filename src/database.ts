import { Field, MerkleMap } from "o1js";

const games = [
    {
        name: "Barbarian",
        creator: "Eren Kardas",
        cover: "images/barbarian.webp",
        price: 20,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Car Race",
        creator: "Hokus Pokus Games",
        cover: "images/car-race.webp",
        price: 10,
        discount: 0,
        rating: 3.5,
        releaseDate: "2021-09-15",
        tags: ["Racing", "Sports"],
    },
    {
        name: "Cyberpunk",
        creator: "Cyborg Games",
        cover: "images/cyberpunk.webp",
        price: 60,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Doll House",
        creator: "Ponchik Games",
        cover: "images/doll-house.webp",
        price: 30,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Medieval",
        creator: "duldul osman",
        cover: "images/medieval.webp",
        price: 40,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Soul Hunting",
        creator: "Soul Games",
        cover: "images/soul-hunting.webp",
        price: 50,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Super Plant",
        creator: "Super Games",
        cover: "images/super-plant.webp",
        price: 50,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Lost in Space",
        creator: "Space Games",
        cover: "images/lost-in-space.webp",
        price: 50,
        discount: 0,
        rating: 4.5,
        releaseDate: "2021-09-15",
        tags: ["Action", "Adventure", "RPG"],
    },
    {
        name: "Murderer Chicken",
        creator: "Chicken Wings",
        cover: "images/murderer-chicken.webp",
        price: 50,
        discount: 0,
        rating: 4.5,
        releaseDate: "2020-09-12",
        tags: ["Action", "Adventure", "RPG"],
    },
];

export interface Game {
    name: string;
    creator: string;
    cover: string;
    price: number;
    discount: number;
    rating: number;
    releaseDate: string;
    tags: string[];
}

class Database {
    games: Game[];
    merkleRoot: Field;
    merkleMap: MerkleMap;

    constructor() {
        this.games = games;
        this.merkleMap = new MerkleMap();
        this.merkleRoot = this.merkleMap.getRoot();
    }
}

export default Database;
