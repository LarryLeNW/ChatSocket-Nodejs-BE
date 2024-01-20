const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const userRouter = require("./router/userRouter");
const chatRouter = require("./router/chatRouter");
const messageRouter = require("./router/messageRouter");
const setupSocketIO = require("./socket");

app.use(express.json());

app.use(
    cors({
        origin: process.env.URL_CLIENT,
        credentials: true,
        methods: ["GET", "POST"],
    })
);
app.get("/", (req, res) => {
    return res.send("Welcome to api mongodb nodejs 😍❤️");
});

app.use(userRouter);
app.use("/chats", chatRouter);
app.use("/messages", messageRouter);

let PORT = process.env.PORT || 9999;

setupSocketIO(server);

server.listen(PORT, () => {
    console.log("Listening on port  : " + PORT);
});

mongoose
    .connect(process.env.ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log("Mongodb connected"))
    .catch((err) => {
        console.log("Mongodb connect failure : ", err.message);
        process.exit(1);
    });
