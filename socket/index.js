const { Server } = require("socket.io");
require("dotenv").config();

function setupSocketIO(app) {
    const io = new Server(app, {
        cors: {
            origin: process.env.URL_CLIENT,
            methods: ["GET", "POST"],
        },
    });

    let onlineUser = [];

    io.on("connection", (socket) => {
        console.log("New connection: ", socket.id);
        // listen to a connection
        socket.on("addNewUser", (userId) => {
            !onlineUser.some((user) => user.userId === userId) &&
                onlineUser.push({
                    userId,
                    socketId: socket.id,
                });
            io.emit("getOnlineUsers", onlineUser);
        });

        // addMessage
        socket.on("sendMessage", (message) => {
            const user = onlineUser.find(
                (user) => user.userId === message.recipientId
            );

            if (user) {
                io.to(user.socketId).emit("getMessage", message);
                io.to(user.socketId).emit("getNotification", {
                    senderId: message.senderId,
                    isRead: false,
                    date: new Date(),
                });
            }
        });

        socket.on("disconnect", () => {
            onlineUser = onlineUser.filter(
                (user) => user.socketId !== socket.id
            );
            io.emit("getOnlineUsers", onlineUser);
        });
    });
}

module.exports = setupSocketIO;
