const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzjjck3.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const allquizCollection = client.db('allquiz').collection('quizCollection');
        const quizInfoCollection = client.db('allquiz').collection('quizInfo');
        const usersCollection = client.db('allquiz').collection('users');

        app.get('/quiz', async (req, res) => {
            const query = {}
            const options = await allquizCollection.find(query).toArray();
            res.send(options)
        })
        app.get('/quizCollection', async (req, res) => {
            const query = {}
            const data = await quizInfoCollection.find(query).toArray();
            res.send(data);
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const data = await usersCollection.find(query).toArray();
            res.send(data);
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });

        })

        app.post('/quiz', async (req, res) => {
            const quiz = req.body;
            const result = await allquizCollection.insertOne(quiz);
            res.send(result);
        })

        app.post('/quizCollection', async (req, res) => {
            const quizCollection = req.body;
            const collection = await quizInfoCollection.insertOne(quizCollection);
            res.send(collection);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        app.put('/users/admin/:id', async (req, res) => {
            const decodedEmail = req.decoded?.email;
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result);

        })

    }
    finally {

    }

}
run().catch(console.log);



app.get('', async (req, res) => {
    res.send('quiz mania server is runing.')
})
app.listen(port, () => console.log(`quiz mania server is runing on port${port}`))