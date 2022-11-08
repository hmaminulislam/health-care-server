const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wpflsxi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
    try{
      //database collections
        const servicesCollection = client.db("HealthCare").collection("services");
        const reviewsCollection = client.db("HealthCare").collection("reviews");

        // services all api 
          app.get("/services", async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const data = await cursor.toArray();
            res.send(data);
          });

        // services limit api 
          app.get("/limit-services", async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query).limit(3);
            const data = await cursor.toArray();
            res.send(data);
          });

          // single service api get
          app.get('/service/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const data = await servicesCollection.findOne(query)
            res.send(data)
          })

          app.get("/", (req, res) => {
            res.send("Health care server is Running...");
          });

          //review post api
          app.post('/add-review', async(req, res) => {
            const review = req.body
            const data = await reviewsCollection.insertOne(review)
            res.send(data)
          })
    }
    catch(error) {
        console.log(error)
    }
}
run().catch(error => console.log(error))


app.listen(port, () => {
    console.log(`Health care server port: ${port}`)
})