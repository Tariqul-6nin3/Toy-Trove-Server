const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
// app.use(cors())
app.use(cors(corsConfig));
// PushSubscriptionOptions("", cors(corsConfig))
app.use(express.json());

const uri = `mongodb+srv://${process.env.TOY_USER}:${process.env.TOY_PASS}@cluster0.jsico6b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const toyCollection = client.db("toyTroveDB").collection("toy");

    app.post("/", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    app.get("/alltoys", async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get("/alltoys", async (req, res) => {
    //    const query = {name:}
    //    const cursor = toyCollection.find().limit(20);
    //    const result = await cursor.toArray();
    //    res.send(result);
    //  });

    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/marvel", async (req, res) => {
      let query = {};
      if (req.query?.subcategory) {
        query = { subcategory: req.query.subcategory };
      }
      const result = await toyCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/searchedtoys", async (req, res) => {
      let query = {};
      if (req.query?.name) {
        query = { name: req.query.name };
      }
      const result = await toyCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    app.get("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/mysortedtoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = toyCollection.find(query).sort({ price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/mysortedtoyslowtohigh", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = toyCollection.find(query).sort({ price: 1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toys-trove is running");
});
app.listen(port, () => {
  console.log(`toys is playing with port ${port}`);
});
