const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
const port = 3000
app.use(cors())
app.use(express.json())





const uri = "mongodb+srv://artify-database:PgyUlxVSfkuMsbd9@cluster0.9ilo8xo.mongodb.net/?appName=Cluster0";

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
    // Connect the client to the server	(optional starting in v4.7)

    // Send a ping to confirm a successful connection
const db = client.db('artify-db')
const artifyCollection = db.collection('collection')
const favoritesCollection = db.collection("favorites");


app.get('/artify', async (req , res)=>{

const result = await artifyCollection.find().toArray()

  res.send(result)
})


app.get("/homepage", async (req, res) => {
  const featured = await artifyCollection
    .find()
    .sort({ _id: -1 }) 
    .limit(6)
    .toArray();

  const topArtists = await artifyCollection
    .find()
    .sort({ likes: -1 }) 
    .limit(6)
    .toArray();

  const result = await artifyCollection.find().sort({ _id: -1 }) .limit(6).toArray();

  res.send({
    featured,
    topArtists,
    result
  });
});



  app.get("/artwork/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const artwork = await artifyCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!artwork) {
          return res.status(404).send({ error: "Artwork not found" });
        }

        res.send(artwork);

      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // LIKE BUTTON
    app.patch("/artwork/:id/like", async (req, res) => {
      const id = req.params.id;

      try {
        await artifyCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } }
        );
        res.send({ success: true });

      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // ADD FAVORITE
    app.post("/favorites", async (req, res) => {
      const { artworkId, userId } = req.body;

      if (!artworkId)
        return res.status(400).send({ error: "artworkId missing" });

      const exists = await favoritesCollection.findOne({ artworkId, userId });

      if (exists) {
        return res.send({ success: true, message: "Already in favorites" });
      }

      await favoritesCollection.insertOne({ artworkId, userId });

      res.send({ success: true });
    });

    // GET ALL FAVORITES OF USER
 app.get("/favorites/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  const userFavorites = await favoritesCollection
    .find({ userId })
    .toArray();

  const artworkIds = userFavorites.map(f => new ObjectId(f.artworkId));

  const artworks = await artifyCollection
    .find({ _id: { $in: artworkIds } })
    .toArray();

  res.send(artworks);
});

app.delete("/favorites/:artworkId/:userId", async (req, res) => {
  const { artworkId, userId } = req.params;

  await favoritesCollection.deleteOne({ artworkId, userId });

  res.send({ success: true });
});



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
