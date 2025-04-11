import express from 'express'
import cors from "cors"
import userRouter from './routes/userRoute.js'

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors);
app.use(express.json());
app.use("/user", userRouter)

app.listen(PORT, () =>
    console.log(`Listening on port ${PORT}`)
)
