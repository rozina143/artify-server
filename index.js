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
await client.connect();
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
// add artwork
app.post("/artify", async (req, res) => {
  const artwork = req.body;

  // Optional: add a userId field
  // artwork.userId = artwork.userEmail;

  try {
    const result = await artifyCollection.insertOne(artwork);
    res.send({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// favouritePage
app.get("/favorites/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find favorite entries for this user
    const favoriteEntries = await favoritesCollection.find({ userId }).toArray();

    // Map artworkId to actual artwork data
    const favoriteArtworks = await Promise.all(
      favoriteEntries.map(async (fav) => {
        const artwork = await artifyCollection.findOne({ _id: new ObjectId(fav.artworkId) });
        return artwork ? { ...artwork, artworkId: fav.artworkId } : null;
      })
    );

    res.send(favoriteArtworks.filter(Boolean));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.delete("/favorites/:userId/:artworkId", async (req, res) => {
  const { userId, artworkId } = req.params;
  try {
    await favoritesCollection.deleteOne({ userId, artworkId });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// my gallery
app.get("/my-artworks/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const artworks = await artifyCollection.find({ userId }).toArray();
    res.send(artworks);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
app.delete("/my-artworks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await artifyCollection.deleteOne({ _id: new ObjectId(id) });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
  app.put("/my-artworks/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // { title, category, medium, image, etc. }
  try {
    await artifyCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
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
