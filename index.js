const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors({
  origin : [
    // 'http://localhost:5173'
    'https://blog-website-15a06.web.app',
    'https://blog-website-15a06.firebaseapp.com'
  ],
  credentials : true
}));
app.use(express.json());
app.use(cookieparser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ce2m8v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const essentialcollection = client.db('essentialitem').collection('item');
    const addblogcollection = client.db('addblog').collection('info');
    const wishlistcollection = client.db('allwishlist').collection('wishlist');
    const commentcollection = client.db('allcomment').collection('comment')

    // auth api

    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      console.log('token user', user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn : '3h'})
      res.cookie('token', token, {
        httpOnly : true,
        secure : true,
        sameSite : 'none'
      })
      .send({success : true})
    })

    app.post('/signout', async(req,res)=>{
      const user = req.body;
      res.clearCookie('token',{maxAge : 0})
      .send({success : true})
    })
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