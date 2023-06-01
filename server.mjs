import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pool from './server/config/database/db.js';
import userRouter from './server/api/users/userRouter.js';
dotenv.config();
const app = express();
const port = process.env.PORT ;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/user", userRouter)
app.use("/user/forgot_password/:token", userRouter);
app.use("/user/answers", userRouter);
app.use('/user/questions', userRouter)
app.use('/username', userRouter)
app.use('/username/id', userRouter)
app.use('/questions/byname', userRouter)

 

  

  // Start the server
app.listen(port,  () => console.log(`Server listening on port http://localhost:${port}`));





