const client = require("../client");
const formatMessage = require("../schema/format-message");
const menuItems = require("./menu-items.json");

const getOldMessages = async (socket, sessionId, io) => {
    let messages = formatMessage("bot", "Welcome to Ekene's Place", sessionId);
    let res = await client.lRange(`messages:${sessionId}`, 0, -1);
    if (res.length === 0) {
        pushMessage(socket, sessionId, messages);
        sendMenu(socket, sessionId);
    } else {
        res.map((x) => {
            socket.emit("createMessage", JSON.parse(x));
        });
    }
};

const sendMenu = async (socket, sessionId) => {
    let insructions = menuItems["menuPrompts"];
    let finalMsg;
    let msg = "Select an option: <br> <br>";
    insructions.forEach((x) => {
        msg += `${x["id"]} -  ${x["prompt"]}<br> <br>`;
    });
    finalMsg = `<p class="text">
                    ${msg}
                </p>`;
    let messages = formatMessage("bot", finalMsg, sessionId);
    await client.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
    socket.emit("SendMenu", messages);
};

const sendFoodMenu = async (socket, sessionId) => {
    let insructions = menuItems["foodItems"];
    let msg = "Select an item to buy: <br> <br>";
    let finalMsg;
    insructions.forEach((x) => {
        msg += `${x["id"]} -  ${x["item"]} - &#8358;${x[
            "price"
        ].toLocaleString()}<br> <br>`;
    });
    finalMsg = `<p class="text">
                    ${msg}
                </p>`;

    let messages = formatMessage("bot", finalMsg, sessionId);
    await client.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
    socket.emit("SendMenu", messages);
};

const pushMessage = (socket, sessionId, messages) => {
    client.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
    socket.emit("createMessage", messages);
};

// sendMenu(876867);
module.exports = { getOldMessages, sendMenu, sendFoodMenu, pushMessage };
