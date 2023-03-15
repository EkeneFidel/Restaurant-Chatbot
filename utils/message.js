const client = require("../client");
const formatMessage = require("../schema/format-message");

let getOldMessages = (socket, sessionId, io) => {
    let messages = formatMessage("bot", "Welcome to le restau", sessionId);
    client.lRange(`messages:${sessionId}`, 0, -1).then((res) => {
        if (res.length === 0) {
            client.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
            socket.emit("createMessage", messages);
        }
        res.map((x) => {
            socket.emit("createMessage", JSON.parse(x));
        });
    });
};

module.exports = { getOldMessages };
