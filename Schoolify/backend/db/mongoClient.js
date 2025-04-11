import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    } catch(err) {
        console.error("Error connecting to MongoDB:", err);
    }

export default mongoClient;