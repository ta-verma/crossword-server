const express = require("express");
const mysql = require("mysql");
const cors = require("cors")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const saltRounds = 10


const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(session({
    key: "userId",
    secret: "sample",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    },
}))
const db = mysql.createConnection({
    user: "sql6445547",
    host: "sql6.freesqldatabase.com",
    password: "gTWpLJuTvB",
    database: "sql6445547"
});

app.post('/googlesignup', (req, res)=>{
    const googleId = req.body.googleId
    const name = req.body.name
    const email = req.body.email

    db.query(
        "INSERT INTO google_user (googleId, name, email) VALUES(?, ?, ?)",
        [googleId, name, email],
        (err, result) => {
            console.log(err)
        }
    )
    res.send({loggedIn : "true"})
})


app.post('/signup', (req, res) => {

    // db.connect()
    const user = req.body.user
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    // var alreadyExists = false
    db.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (result.length > 0) {
                res.send({ message: "username already exists" })
            }
            else {
                db.query(
                    "SELECT * FROM users WHERE email = ?;",
                    email,
                    (err, result) => {
                        if (result.length > 0) {
                            res.send({ message: "email already exists" })
                        }
                        else {
                            bcrypt.hash(password, saltRounds, (err, hash) => {
                                if (err) {
                                    console.log(err)
                                }
                                db.query(
                                    "INSERT INTO users (username, name, email, password) VALUES(?, ?, ?, ?)",
                                    [username, user, email, hash],
                                    (err, result) => {
                                        console.log(err);
                                    }
                                )
                            })
                        }
                    }
                )
            }
        }
    )

    res.send({ message: "ok" })
})

app.post('/signin', (req, res) => {
    // db.connect()
    // const user = req.body.user
    const username = req.body.username
    const password = req.body.password
    // const email = req.body.email

    db.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (err) {
                res.send({ err: err })
            }

            if (result.length > 0) {
                // console.log(result)
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        // console.log(req.session.user)
                        res.send(result)
                    }
                    else {
                        res.send({
                            message: "wrong username/password combination!"
                        })
                    }
                })
            }
            else {
                res.send({
                    message: "User dosen't exist"
                })
            }
        }
    )
})

app.get("/signin", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Server is Online ");
})
