const path = require("path");
const express = require("express");
const session = require("express-session");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const client = require("./client");
const { getOldMessages } = require("./utils/message");
const formatMessage = require("./schema/format-message");

const app = express();
const sessionMiddleware = session({
    secret: "mysessionmiddlewaresecret",
    cookie: { httpOnly: true, expires: 1000 * 60 * 60 * 24 * 7 },
    resave: true,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
require("dotenv").config();

PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("room");
});

const wrap = (sessionMiddleware) => (socket, next) =>
    sessionMiddleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

let order = [];

io.on("connection", (socket) => {
    const session = socket.request.session;
    const sessionId = session.id;
    socket.join(sessionId);
    getOldMessages(socket, sessionId, io);

    socket.on("message", (messages) => {
        let userMessage = formatMessage("user", messages, sessionId);
        client.RPUSH(`messages:${session.id}`, JSON.stringify(userMessage));
        io.to(sessionId).emit("createMessage", userMessage);

        let botMessage = "";
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
