/// Imports Bibliotecas ///
import dayjs from "dayjs";

/// Imports API Connection & Security ///
import express from "express";
import cors from "cors";

/// Imports Database & Security ///
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

/// Código ///



// Inserindo Usuário //
app.post("/participants", (req, res) => {
    const nome = req.body.name;

    db.collection("participants").insertOne({ name: nome, lastStatus: Date.now() });
    const prom = db.collection("messages").insertOne({
        from: nome,
        to: 'Todos', text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
    })
    prom.then(() => res.sendStatus(201))
})


// Achando os Usuários //

app.get("/participants", (req,res) => {
    const users = db.collection("participantes").find();
    res.send(users);
})
,











/// PORT Declaration and Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))


