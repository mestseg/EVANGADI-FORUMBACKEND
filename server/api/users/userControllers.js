import {register,userId,profile,allUsers,getUserByemailId} from "../users/userService.js";
import pool from "../../../server/config/database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv"
dotenv.config();

export const createUser = (req, res) => {
  const { userName, firstName, lastName, email, password } = req.body;
  if (!userName || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All information is not provided" });
  }
  if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password)) {
    return res
      .status(400)
      .json({
        message:
          "Password should contain at least 8 characters including uppercase, lowercase, and numeric characters",
          showAlert: true,
      });
  }
  pool.query(
    `SELECT * FROM registrations WHERE user_email = ?`,
    [email],
    (err, results) => {
      console.log(req.body);
      console.log(results);
      if (err) {
        console.log(err);
        return res.status(err).json({ message: "Database connection error" });
      }
      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "An account with this email already exists" ,showAlert: true });
      } else {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = {
          userName,
          firstName,
          lastName,
          email,
          password: hashedPassword,
        };
        register(user, (err, results) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ message: "Connection error for user" });
          }
          const userId = results.insertId; // Fetch the inserted 'user_id' value
          if (!userId) {
            return res
              .status(500)
              .json({ message: "Failed to get user ID after registration" });
          }
          const userProfile = { userId, userName, firstName, lastName, email };
          profile(userProfile, (err, results) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ message: "Failed to create user profile" });
            }
            console.log("form data is", userProfile);
            return res
              .status(200)
              .json({ message: "User registered successfully" });
          });
        });
      }
    }
  );
};

export const getUsers = (req, res) => {
  allUsers((err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database connection error" });
    }
    return res.status(200).json({ data: results });
  });
};

export const getUserbyId = (req, res) => {
  const id = req.params.id;
  console.log("id==", id, "user==", req.id);
  userId(req.id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "connection err try again" });
    }
    if (!results) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ data: results });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      message: "not all information provided please fill all",
    });

  getUserByemailId(email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "database error" });
    }

    if (!results) {
      return res
        .status(404)
        .json({ message: "no account found with this information" });
    }

    const isMatch = bcrypt.compareSync(password, results.user_password);

    if (!isMatch) {
      return res.status(404).json({ message: "invalid credentials" });
    }

    const token = jwt.sign({ id: results.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    return res.json({
      token,
      user: {
        id: results.user_id,
        display_name: results.user_name,
      },
      expires: tokenExpiration.toISOString(), // Send the token expiration time to the fron
    });
  });
};

//** post quesions into da */
export const PostQuestions = (req, res) => {
  const { question, questionDescription, questionCodeBlock, tags, userId, post_id } =
    req.body;

  const questionsTable = `INSERT INTO questions (question, question_description, question_code_block, tags, user_id, post_id, time ) 
    VALUES (?, ?, ?, ?, ?, ? ,?)`;
  pool.query(
    questionsTable,
    [question, questionDescription, questionCodeBlock, tags, userId, post_id, new Date() ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error creating question");
      } else {
        const question_id= result.insertId; // get the auto-incremented question_id
        // console.log("Question created successfully with id:", question_id);
        res.status(201).json(result);
        // console.log(question_id);
      }
    }
  );
};

export const createAnswer = (req, res) => {
  
  const {answer, userId,answerCodeBlock,questionId} = req.body;
  const insertAnswer = `INSERT INTO answers (answer, answer_code_block, user_id, question_id, time)
 VALUES( ?, ?, ?,? ,?)`;
  pool.query(insertAnswer, [answer, answerCodeBlock, userId, questionId, new Date()], (answerError, answerResult) => {
    if (answerError) {
      console.error('Error creating answer:', answerError);
      res.status(500).send('Error creating answer');
    } else {
      const answerId = answerResult.insertId; 
      console.log('Answer created:', answerId);
      
      console.log(`quesionId is`, questionId);
      res.sendStatus(200);
    }
  });
};


//** get all quesion from the database  and disply in the home page by the newest to the oldest */
export const  getQuestionById= (req, res) => {
 
  const sql = "SELECT questions.question_id, registrations.user_id, registrations.user_name, questions.question, questions.question_description, questions.time FROM questions LEFT OUTER JOIN registrations ON questions.user_id = registrations.user_id ORDER BY questions.time DESC";

  pool.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ error: "Error retrieving questions" });
    } else {
      // console.log("Questions:", result);
      // console.log("QuserId:");
      res.send(result);
    }
  });
};

//** get answers by user name */
export const GetanswerByusername = (req, res) => {
  pool.query(
    `SELECT q.question_id, q.question, q.question_description, q.time AS question_time,
    a.answer_id, a.answer, a.time AS answer_time,
    r.user_name AS user_name
  FROM questions q
  JOIN answers a ON q.question_id = a.question_id
  JOIN registrations r ON a.user_id = r.user_id
  ORDER BY a.time DESC; `,
 (err, results) => {
      if (err) {
        throw err;
      }
      console.log(`Fetching answers for question by username`);
      res.json(results);
    }
  );
};

