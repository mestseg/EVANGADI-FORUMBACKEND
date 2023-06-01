import dotenv from 'dotenv';
dotenv.config();
import mysql2 from 'mysql2';
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool=mysql2.createPool({
  host: "localhost",
  user: "EvangadiProject",
  database:"evangadiforum",
  password:"WZmBeg_1mQmXk7p4"
})
pool.getConnection((err,connection)=>{
if (err) console.log(`err is :`, err);
  console.log("connected to database you are good to go");

})
// const pool = mysql2.createConnection(process.env.DATABASE_URL);
// console.log('Connected to PlanetScale!');

let registration = `
CREATE TABLE IF NOT EXISTS registrations(
  user_id INT AUTO_INCREMENT, 
  user_name VARCHAR(225) NOT NULL,
  user_email VARCHAR(225) NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  user_password_reset_token VARCHAR(255) DEFAULT NULL, 
  user_password_reset_expires DATETIME DEFAULT NULL, 
  PRIMARY KEY (user_id)
);
`;


let profiles = `CREATE TABLE if not exists profiles(
user_profile_id int auto_increment, 
user_id int not null, 
first_name varchar(225) not null,
last_name varchar(225) not null,
PRIMARY KEY (user_profile_id),
FOREIGN KEY (user_id) REFERENCES registrations(user_id)
)`;

let questions = `CREATE TABLE if not exists questions(
  question_id int auto_increment,
  question varchar(225) not null, 
  question_description varchar(225),
  question_code_block varchar(225), 
  tags varchar(225),
  post_id varchar(225) not null, 
  user_id int not null,  
  time DateTime not null,  
  PRIMARY KEY (question_id),
  FOREIGN KEY (user_id) REFERENCES registrations(user_id)
)`;
let answers = `CREATE TABLE if not exists answers(
  answer_id int auto_increment,
  answer varchar(225) not null,
  answer_code_block varchar(225), 
  user_id int not null,
  question_id INT NOT NULL,
  PRIMARY KEY (answer_id),
  time DateTime not null,  
  FOREIGN KEY (user_id) REFERENCES registrations(user_id),
   FOREIGN KEY (question_id) REFERENCES questions(question_id)
  )`;
//** */ Execute SQL queries
pool.query(registration, (err, results) => {
    if (err) throw err;
    console.log("registrations table created");
});

pool.query(profiles, (err, results) => {
    if (err) throw err;
    console.log("profiles table created");
});

pool.query(questions, (err, results) => {
    if (err) throw err;
    console.log("questions table created");
});

pool.query(answers, (err, results) => {
    if (err) throw err;
    console.log("answers table created");
});



export default pool;




