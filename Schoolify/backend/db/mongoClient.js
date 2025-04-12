import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

async function connectMongoDB(uri) {
    mongoose.connect(uri)
    .then(() => console.log(mongoose.connection.name, " DB connected"))
    .catch(err => console.log("ERROR: ", err));
}

export default connectMongoDB;