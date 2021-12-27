const express = require("express");
const mysql = require("mysql");
const cors = require("cors")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const session = require("express-session");
const crossword = require("./helpers/create");

const saltRounds = 10

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["https://cross-quest.herokuapp.com", "http://localhost:3000", "https://crossword-plum.vercel.app"],
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
        expires: 24 * 60 * 60 * 1000
    },
}))

const db = mysql.createConnection({
    user: "sql6445547",
    host: "sql6.freesqldatabase.com",
    password: "gTWpLJuTvB",
    database: "sql6445547"
});

// setInterval(() => {
//     db.query('select 1')
//     console.log("ping successful")
// }, 1000 * 60 * 3) // every 3 minutes

// SELECT CONVERT_TZ(CURRENT_TIMESTAMP,'+00:00','+05:59')

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
                        if (err) {
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

app.post('/togglePrivacy', (req, res) => {
    const id = req.body.id
    const privacy = req.body.privacy
    // console.log(id, privacy)
    db.query(
        `UPDATE private_crosswords SET privacy = ? WHERE id = ?`,
        [privacy, id],
        (err, result) => {
            if (err)
                res.send({ message: "Something went wrong." })
            else
                res.send({ message: "changed" })
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
            if (result?.length === 0) {
                db.query(
                    "SELECT * FROM users WHERE email = ?;",
                    email,
                    (err, result) => {
                        if (result?.length === 0) {
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

app.post('/updateProfile', (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (name === "" || username === "" || email === "" || password === "") {
        res.send({ message: "Please fill in all fields." })
    }
    else {
        db.query(
            "SELECT * FROM users WHERE username != ? AND email = ?;",
            [username, email],
            (err, result) => {
                if (result.length === 0) {
                    db.query(
                        "SELECT * FROM users WHERE username = ? ",
                        username,
                        (err, result) => {
                            if (result) {
                                bcrypt.compare(password, result[0].password, (err, result) => {
                                    if (err)
                                        res.send({ message: "Something went wrong." })
                                    if (result) {
                                        db.query(
                                            "UPDATE users SET name = ?, email = ? WHERE username = ?;",
                                            [name, email, username],
                                            (err, result) => {
                                                if (err) {
                                                    res.send({ message: "Something went wrong." })
                                                }
                                                else {
                                                    res.send({ message: "ok" })
                                                }
                                            }
                                        )
                                    }
                                    else {
                                        res.send({ message: "Incorrect password." })
                                    }
                                })
                            }

                            else {
                                res.send({ message: "Username not exists." })
                            }
                        })
                }
                else {
                    res.send({ message: "Email already exists." })
                }
            }
        )
    }
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
            if (result?.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (error)
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

app.post('/updatePassword', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const newPassword = req.body.newPassword

    db.query(
        "SELECT * FROM users WHERE username = ?;",
        username,
        (err, result) => {
            if (err) {
                res.send({ message: "something went wrong" })
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (error)
                        console.log(error)
                    if (response) {
                        bcrypt.hash(newPassword, saltRounds, (err, hash) => {
                            if (err) {
                                console.log(err)
                            }
                            db.query(
                                "UPDATE users SET password = ? WHERE username = ?;",
                                [hash, username],
                                (err, result) => {
                                    if (err) {
                                        res.send({ message: "Something went wrong." })
                                    }
                                    else {
                                        res.send({ message: "ok" })
                                    }
                                }
                            )
                        })
                    }
                    else {
                        res.send({
                            message: "wrong password!"
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

app.post('/getUserData', (req, res) => {
    const username = req.body.username
    db.query(
        "SELECT * FROM private_crosswords WHERE username = ?;",
        username,
        (err, result) => {
            if (err) {
                res.send({ message: "something went wrong" })
            }
            if (result.length > 0) {
                res.send({ message: "data", data: result })
            }
            else {
                res.send({
                    message: "no data"
                })
            }
        }
    )
})

app.post('/savePuzzle', (req, res) => {
    const username = req.body.username
    const name = req.body.name
    const puzzle = JSON.stringify(req.body.data)
    // console.log(username)

    db.query(
        "SELECT * FROM private_crosswords WHERE username = ? AND crossword = ?;",
        [username, puzzle],
        (err, result) => {
            if (err) {
                res.send({ message: "something went wrong" })
            }
            if (result.length === 0) {
                db.query(
                    "INSERT INTO private_crosswords (username, crossword, name) VALUES(?, ?, ?);",
                    [username, puzzle, name],
                    (err, result) => {
                        if (err) {
                            console.log(err)
                            res.send({ message: "Something went wrong." })
                        }
                        else {
                            res.send({ message: "saved" })
                        }
                    }
                )
            }
            else {
                res.send({ message: "already saved" })
            }
        })
})

app.post('/deleteCrossword', (req, res) => {
    const id = req.body.id

    db.query(
        "DELETE FROM private_crosswords WHERE id = ?;",
        id,
        (err, result) => {
            if (err) {
                res.send({ message: "something went wrong" })
            }
            else {
                res.send({ message: "deleted" })
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
    if (wordList?.length > 0) {
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

