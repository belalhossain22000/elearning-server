const express = require("express");
const { ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
// Enable  middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DATABASE_URL;
//console.log(process.env.ACCESS_TOKEN_SECRET_KEY);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//mongodb function connect

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("E-Learning").collection("users");

    //registration route
    app.post("/users/create-user", async (req, res) => {
      try {
        const user = req.body;
        const email = user.email;
        // Check if the user already exists (you can define your own logic here)
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
          throw new Error("User Already Exist");
        }

        // Create a new user in the MongoDB database
        await usersCollection.insertOne(user);

        // Respond with success message
        res.status(201).send({ message: "User created successfully", user });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error });
      }
    });

    // Login route
    app.post("/users/login", async (req, res) => {
      // Mock user data (replace this with your authentication logic)
      const { email, password, parseUId } = req.body;
      // console.log(req.body);
      const existingUser = await usersCollection.findOne({ email });
      const userId = existingUser?._id;
      console.log(existingUser.uniqueId);

      // Check if username and password are valid (dummy check in this example)
      if (
        email === existingUser?.email &&
        password === existingUser?.password &&
        parseUId === existingUser?.uniqueId
      ) {
        // Replace with the user ID from your database
        const token = jwt.sign(
          { userId },
          process.env.ACCESS_TOKEN_SECRET_KEY,
          {
            expiresIn: "7d",
          }
        );
        res.status(200).send({ token, email });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });

    //get all users
    app.get("/users", async (req, res) => {
      try {
        const user = await usersCollection.find().toArray();

        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });
    //get user by email
    app.get("/users/:email", async (req, res) => {
      const userEmail = req.params.email;

      try {
        const user = await usersCollection.findOne({ email: userEmail });

        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });

    // Send a ping to confirm a successful connection
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
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
