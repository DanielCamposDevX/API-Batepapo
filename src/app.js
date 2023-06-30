/// Imports API Connection & Security
import express from "express";
import cors from "cors";


/// Imports Database & Security
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


/// API Connection ///
const app = express();
app.use(express.json());
app.use(cors());




/// Database Connection ///
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))















/// PORT Declaration and Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))


