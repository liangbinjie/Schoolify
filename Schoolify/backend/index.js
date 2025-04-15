import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import courseRouter from './routes/courseRoute.js';
import enrollmentRouter from './routes/enrollmentRoute.js';
import connectMongoDB from './db/mongoClient.js';
import authRouter from './routes/Auth/loginRoute.js';

const PORT = process.env.PORT || 5000;
const schoolify_uri = process.env.MONGO_SCHOOLIFY_DB_URI;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", userRouter);
app.use("/", authRouter);
app.use("/course", courseRouter);
app.use("/enrollment", enrollmentRouter);

app.get("/", (req, res) => {
    return res.status(234).send("hello world");
});

try {
    connectMongoDB(schoolify_uri)

    app.listen(PORT, () =>
        console.log(`Listening on port ${PORT}`)
    );
} catch (err) {
    console.log(err)
}

