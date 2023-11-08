const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

// blog-website
// 8H4TROCgWUy2d97v

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ce2m8v.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const essentialcollection = client.db('essentialitem').collection('item');
const addblogcollection = client.db('addblog').collection('info');
const wishlistcollection = client.db('allwishlist').collection('wishlist');
const commentcollection = client.db('allcomment').collection('comment')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    app.get('/item', async(req,res)=>{
        const cursor = await essentialcollection.find().toArray();
        res.send(cursor)
    })

    // addblog apis
    app.get('/info', async(req,res)=>{
      const cursor = await addblogcollection.find().toArray();
      res.send(cursor)
  })


    app.post('/info', async(req,res)=>{
        const alldata = req.body;
        // console.log(alldata)
        const result = await addblogcollection.insertOne(alldata);
        res.send(result)
    })
// for blogdetails
    app.get('/info/:id', async(req,res)=>{
      const id = req.params.id;
      // console.log(id)
      const options = {
        projection: { _id:1, title: 1, image: 1,shortdes : 1 ,category : 1,longdes :1 },
      };
      const filter = { _id : new ObjectId(id)}
      const result = await addblogcollection.findOne(filter,options)
      res.send(result)
    })

    app.patch('/info/:id', async(req,res)=>{
      const id = req.params.id;
      console.log(id)
      const filter = { _id : new ObjectId(id)}
    const updatedbody = req.body;
    console.log(updatedbody)
      const updateDoc = {
        $set: {
          title : updatedbody.title,
          image : updatedbody.image,
       shortdes : updatedbody.shortdes,
      category  : updatedbody.category,
        longdes : updatedbody.longdes
        },
      };
      const result = await addblogcollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    // wishlist api
    app.post('/wishlist', async(req,res)=>{
      const alldata = req.body;
      // console.log(alldata);
      const result = await wishlistcollection.insertOne(alldata);
      res.send(result)
    })

    app.get('/wishlist', async(req,res)=>{
      const cursor = await wishlistcollection.find().toArray()
      res.send(cursor)
    })

    app.delete('/wishlist/:id', async(req,res)=>{
      const id = req.params.id;
      // console.log(id)
      const filter = { _id : new ObjectId(id)}
      const result = await wishlistcollection.deleteOne(filter)
      res.send(result)
    })

    // comment api

    app.post('/comment',async(req,res)=>{
      const alldata = req.body;
      const result = await commentcollection.insertOne(alldata)
      res.send(result)
    })

    app.get('/comment',async(req,res)=>{
      const cursor = await commentcollection.find().toArray()
      res.send(cursor)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('coming from get blog')
})

app.listen(port, ()=>{
    console.log(`coming from port ${port}`)
})