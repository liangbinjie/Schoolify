import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './routes/userRoute.js';
import courseRouter from './routes/courseRoute.js';
import enrollmentRouter from './routes/enrollmentRoute.js';
import connectMongoDB from './db/mongoClient.js';
import tabsRouter from './routes/courseTabsRoute.js';
import fileRouter from './routes/fileRoute.js';
import evaluationRouter from "./routes/courseEvaluationsRoute.js";
import authRouter from './routes/Auth/loginRoute.js';
import friendRouter from './routes/friendRoute.js';
// import redis from './db/redis.js';
// import setupSocketIO from './routes/socket/msgSocket.js';

import neo4jRouter from './routes/neo4jRoutes/friends.js';

const PORT = process.env.PORT || 5000;
const schoolify_uri = process.env.MONGO_SCHOOLIFY_DB_URI;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware para analizar JSON y datos codificados en URL
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis middleware
// app.use((req, res, next) => {
//     req.redis = redis;
//     next();
// });

// Rutas
app.use("/user", userRouter);
app.use("/", authRouter);
app.use("/courses", courseRouter);
app.use("/enrollment", enrollmentRouter);
app.use('/api/tabs', tabsRouter);
app.use('/api/files', fileRouter);
app.use("/api/evaluations", evaluationRouter);
app.use("/api/friends", friendRouter);

app.use("/api/neo4j", neo4jRouter);

app.get("/", (req, res) => {
    return res.status(234).send("hello world");
});

// Setup Socket.IO
// setupSocketIO(io);

try {
    await connectMongoDB(schoolify_uri);
    
    // Test Redis connection
    // await redis.ping();
    // console.log('Redis connection successful');

    httpServer.listen(PORT, () =>
        console.log(`Listening on port ${PORT}`)
    );
} catch (err) {
    console.log(err);
}