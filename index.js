const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wpflsxi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function jwtVerify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    //database collections
    const servicesCollection = client.db("HealthCare").collection("services");
    const reviewsCollection = client.db("HealthCare").collection("reviews");

    // services all get api
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    // services limit get api
    app.get("/limit-services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).limit(3);
      const data = await cursor.toArray();
      res.send(data);
    });

    // single service api get
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = await servicesCollection.findOne(query);
      res.send(data);
    });

    app.get("/", (req, res) => {
      res.send("Health care server is Running...");
    });

    //reviews get api
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { serviceId: id };
      const cursor = reviewsCollection.find(query).sort({ _id: -1 });
      const data = await cursor.toArray();
      res.send(data);
    });
    //reviews get api
    app.get("/my-reviews", jwtVerify, async (req, res) => {
      const decoded = req.decoded;

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewsCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    //single review get
    app.get("/edit-review-get/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = await reviewsCollection.findOne(query);
      res.send(data);
    });

    //review post api
    app.post("/add-review", async (req, res) => {
      const review = req.body;
      const data = await reviewsCollection.insertOne(review);
      res.send(data);
    });

    //jwt post api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    //service post api
    app.post("/add-service", async (req, res) => {
      const service = req.body;
      const data = await servicesCollection.insertOne(service);
      res.send(data);
    });

    //edit review patch api
    app.patch("/edit-review/:id", async (req, res) => {
      const updateReview = req.body;
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          review: updateReview.review,
          image: updateReview.image,
        },
      };
      const data = await reviewsCollection.updateOne(query, updateDoc, options);
      res.send(data);
    });

    //delete review api
    app.delete("/delete-review", async (req, res) => {
      const id = req.headers.id;
      const query = { _id: ObjectId(id) };
      const data = await reviewsCollection.deleteOne(query);
      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
}
run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`Health care server port: ${port}`);
});
