/// Package imports ///
import dayjs from "dayjs";
import Joi from "joi";

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



///////////////////// Code ///////////////////////

//Schema for data Validation
const schemauser = Joi.object({
    name: Joi.string()
        .min(1),
})


// User login //
app.post("/participants", async (req, res) => {

    const data = req.body;
    const validate = schemauser.validate(data, { abortEarly: false });

    if (validate.error) {

        //const errors = validate.error.details.map((detail) => detail.message);
        return res.sendStatus(422)//.send(errors);

    }
    else {

        const nome = data.name;

        try {
            const user = await db.collection("participants").findOne({ name: nome });

            if (user) {
                res.sendStatus(409)
            }

            else {

                await db.collection("participants").insertOne({ name: nome, lastStatus: Date.now() });
                await db.collection("messages").insertOne({
                    from: nome,
                    to: 'Todos', text: 'entra na sala...',
                    type: 'status',
                    time: dayjs().format('HH:mm:ss')
                })
                return res.sendStatus(201);
            }
        }

        catch (error) {
            return res.sendStatus(500);
        }
    }
})




// Loading Users //

app.get("/participants", async (req, res) => {
    try {
        const users = await db.collection("participants").find().toArray();
        return res.send(users);
    }
    catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
})












/// PORT Declaration and Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))


