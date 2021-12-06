const express = require("express");
const mysql = require("mysql");
const cors = require("cors")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const session = require("express-session");
const crossword = require("./create");

const saltRounds = 10

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["https://cross-quest.herokuapp.com",
        "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));


app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(session({
    key: "userId",
    secret: "crossword",
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

app.post('/oauthsignup', (req, res) => {
    const id = req.body.id
    const name = req.body.name
    const email = req.body.email
    const oauth = req.body.oauth
    const object = req.body.object

    db.query(
        "INSERT INTO oauth_users (id, name, email, oauth, object) VALUES(?, ?, ?, ?, ?)",
        [id, name, email, oauth, object],
        (err, result) => {
            console.log(err)
        }
    )
    res.send({ loggedIn: "true" })
})

app.post('/contact', (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const message = req.body.message


    db.query(
        "INSERT INTO contact (name, email, message) VALUES(?, ?, ?)",
        [name, email, message],
        (err, result) => {
            if (err)
                res.send({ message: "Something went wrong." })
            else
                res.send({ message: "ok" })
        }
    )

})

app.post('/save', (req, res) => {
    const recdata = req.body.data
    const data = JSON.stringify(recdata)
    db.query(
        "SELECT * FROM public_crosswords WHERE crossword = ?",
        [data],
        (err, result) => {
            if (err)
                res.send({ message: "Something went wrong.1" })
            else if (result.length === 0) {
                db.query(                 
                    `INSERT INTO public_crosswords (crossword) VALUES(?);`,
                    [data],
                    (err, result) => {
                        if (err){
                            console.log(err)
                            res.send({ message: "Something went wrong." })
                        }
                        else
                            res.send({ message: "ok", id: result.insertId })
                    }
                )
            }
            else {
                res.send({ message: "ok", id: result[0].id })
            }

        }
    )
})

app.get("/getCrossword", (req, res) => {
    const id = req.query.id
    db.query(
        "SELECT * FROM public_crosswords WHERE id = ?",
        [id],
        (err, result) => {
            if (err)
                res.send({ message: "Something went wrong." })
            else
                res.send({ message: "ok", data: JSON.parse(result[0].crossword) })
        })
})


app.post('/signup', (req, res) => {

    // db.connect()
    const user = req.body.user
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    db.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (result.length === 0) {
                db.query(
                    "SELECT * FROM users WHERE email = ?;",
                    email,
                    (err, result) => {
                        if (result.length === 0) {
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
                            res.send({ message: "ok" })
                        }
                        else {
                            res.send({ message: "email already exists" })
                        }
                    }
                )
            } else {
                res.send({ message: "username already exists" })
            }
        }
    )
})


app.post('/signin', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    db.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (err) {
                res.send({ err: err })
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if(error)
                        console.log(error)
                    if (response) {
                        req.session.user = result;
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

app.post("/generate", (req, res) => {
    const wordList = req.body.wordList
    // console.log(wordList)
    if (wordList.length > 0) {
        const result = crossword.Crossword(wordList)
        // console.log(result)
        res.send({ result: result })
    }
})

app.get("/generate", (req, res) => {
    const result = crossword.Crossword()
    res.send({ result: result })
})

// logout route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.send({ loggedIn: false });
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Server is Online ");
})

