import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await mongoClient.connect();
    console.log("Successfully connected to MongoDB!");
    } catch(err) {
        console.error("Error connecting to MongoDB:", err);
    }

export default mongoClient;