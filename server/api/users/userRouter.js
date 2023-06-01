import express from 'express';
import {  PostQuestions,  createUser,getUserbyId,getUsers, login , createAnswer, getQuestionById, GetanswerByusername, } from './userControllers.js';
import auth from './middleware/auth.js'
const router = express.Router();

router.post('/', createUser);
router.get('/all', getUsers); //?to get all the user in the db
router.get('/',auth, getUserbyId)
router.post('/login', login)
//?Post questions
router.post("/questions", PostQuestions)
//* fetch questions
router.get('/questions/byname', getQuestionById)
//? post answers
router.post('/answers/:questionId',createAnswer)

//** get answers from dv */
router.get('/answers/:id',GetanswerByusername)


export default router;



