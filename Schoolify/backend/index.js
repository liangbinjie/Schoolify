import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import courseRouter from './routes/courseRoute.js';
import enrollmentRouter from './routes/enrollmentRoute.js';
import connectMongoDB from './db/mongoClient.js';
import tabsRouter from './routes/courseTabsRoute.js';
import fileRouter from './routes/fileRoute.js';
import evaluationRouter from "./routes/courseEvaluationsRoute.js";
import authRouter from './routes/Auth/loginRoute.js';
import friendRouter from './routes/friendRoute.js';
import redisCluster from './db/redis.js';

const PORT = process.env.PORT || 5000;
const schoolify_uri = process.env.MONGO_SCHOOLIFY_DB_URI;

const app = express();

// Middleware para analizar JSON y datos codificados en URL
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make Redis cluster available in request object
app.use((req, res, next) => {
    req.redisCluster = redisCluster;
    next();
});

// Rutas
app.use("/user", userRouter);
app.use("/", authRouter);
app.use("/courses", courseRouter);
app.use("/enrollment", enrollmentRouter);
app.use('/api/tabs', tabsRouter);
app.use('/api/files', fileRouter);
app.use("/api/evaluations", evaluationRouter);
app.use("/api/friends", friendRouter);

app.get("/", (req, res) => {
    return res.status(234).send("hello world");
});

try {
    await connectMongoDB(schoolify_uri);
    
    // Test Redis connection
    await redisCluster.ping();
    console.log('Redis Cluster connection successful');

    app.listen(PORT, () =>
        console.log(`Listening on port ${PORT}`)
    );
} catch (err) {
    console.log(err);
}