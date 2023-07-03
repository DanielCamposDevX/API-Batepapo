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
const schemauser = Joi.string().min(1);

const schemamsg = Joi.object({
    to: Joi.string()
        .min(1),
    text: Joi.string()
        .min(1),
    type: Joi.string()
        .valid("message", "private-message"),
})
const limitschema = Joi.number().integer().positive().required();


/// Status Updating ///
const Inactive = async () => {
    const validatedate = Date.now() - 10000;
    try {
        const removed = await db.collection('participants').find({
            lastStatus: { $lt: validatedate }
        }).toArray();
        await db.collection('participants').deleteMany({
            lastStatus: { $lt: validatedate }
        });
        await db.collection('messages').insertMany(removed.map(participant => ({
            from: participant.name,
            to: 'Todos',
            text: 'sai da sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        })));
    }
    catch (error) {
        console.log(error);
    }
}
setInterval(Inactive, 15000)


// User login //
app.post("/participants", async (req, res) => {

    const data = req.body.name;

    const validate = schemauser.validate(data);

    if (validate.error || !req.body.name) {

        const errors = validate.error.details.map((detail) => detail.message);
        res.status(422).send(errors)

    }
    else {

        const nome = data;

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
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})


// Message posting //
app.post("/messages", async (req, res) => {
    const { to, text, type } = req.body;
    const data = { to, text, type };
    const from = req.header('User');
    try {
        const user = await db.collection("participants").findOne({ name: from });
        if (user) {
            const msg = { to, text, type, from, time: dayjs().format('HH:mm:ss') };
            const validate = schemamsg.validate(data);
            if (validate.error || !to || !text || !type) {
                //const errors = validate.error.details.map((detail) => detail.message);
                return res.sendStatus(422)//.send(errors);
            }
            else {
                await db.collection("messages").insertOne(msg);
                return res.status(201).send(msg);
            }
        }
        else {
            return res.sendStatus(422);
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


// Message Load //
app.get("/messages", async (req, res) => {
    const user = req.header('User');
    const limit = parseInt(req.query.limit);
    if (!limit) {
        try {
            const messages = await db.collection("messages").find({
                $or: [
                    { to: "todos" },
                    { to: user },
                    { from: user }
                ]
            }).limit(1).toArray();

            return res.status(200).send(messages);
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        }
    }
    else {
        const validate = limitschema.validate(limit);
        if (validate.error) {
            //const errors = validate.error.details.map((detail) => detail.message);
            return res.sendStatus(422)//.send(errors);
        }
        else {
            try {
                const messages = await db.collection('messages').find({
                    $or: [
                        { to: "todos" },
                        { to: user }
                    ]
                }).limit(limit).toArray();

                return res.status(200).send(messages);
            } catch (error) {
                console.log(error);
                return res.sendStatus(500);
            }
        }
    }
});


// Status Online and Offline //
app.post("/status", async (req, res) => {
    const user = req.header('User');
    const validation = await db.collection('participants').findOne({ name: user })
    if (!user || !validation) {
        return res.sendStatus(404);
    }
    else {
        try {
            await db.collection('participants').updateOne(
                { _id: validation._id },
                { $set: { lastStatus: Date.now() } }
            )
            return res.sendStatus(200);
        }
        catch (error) {
            console.log(error);
            return res.sendStatus(500);
        }
    }
})



/// PORT Declaration and Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))


