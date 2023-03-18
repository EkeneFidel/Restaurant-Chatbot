const { v4: uuidv4 } = require("uuid");

const { sendFoodMenu, sendMenu, pushMessage } = require("../utils/message");
const formatMessage = require("../schema/format-message");

let foodMenu;
let mainMenu;

const placeOrder = (socket, sessionId) => {
    sendFoodMenu(socket, sessionId);
    mainMenu = false;
    foodMenu = true;
    // Show user food menu by setting foodMenu = true and mainMenu = false
    return [mainMenu, foodMenu];
};
const checkoutOrder = (socket, client, sessionId, currentOrder) => {
    currentOrder.id = client.RPUSH(
        `orders:${sessionId}`,
        JSON.stringify(currentOrder)
    );
    currentOrder.items = {};
    currentOrder.totalPrice = 0;
    let botMessage = formatMessage("bot", "Order completed", sessionId);
    pushMessage(socket, sessionId, botMessage);
    mainMenu = true;
    foodMenu = false;
    sendMenu(socket, sessionId);
    return [mainMenu, foodMenu];
};
const showOrderHistory = async (socket, client, sessionId) => {
    let type = "order history";
    let found = await client.exists(`orders:${sessionId}`);
    let finalMsg = "";
    if (found === 1) {
        let res = await client.lRange(`orders:${sessionId}`, 0, -1);
        let finalTable;

        finalTable = res.map(async (x) => {
            let id = await client.lPos(`orders:${sessionId}`, x);
            let currentOrder = JSON.parse(x);
            let msg = "";
            let table = "";
            for (let key in currentOrder.items) {
                msg += `<tr>
                            <td colspan="2">${currentOrder.items[key].item}</td>
                            <td>${currentOrder.items[key].quantity}</td>
                            <td>&#8358;${currentOrder.items[
                                key
                            ].price.toLocaleString()}</td>
                        </tr>`;
            }
            msg += `<tr>
                        <td colspan="2"></td>
                        <td>Total</td>
                        <td>&#8358;${currentOrder.totalPrice.toLocaleString()}</td>
                    </tr>`;
            table += `<div class="table">
                            <h1 class="reciept-title">Your Order ${id}</h1>
                            <table class="reciept-table">
                                <thead>
                                    <tr>
                                        <th colspan="2">Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${msg}
                                </tbody>
                            </table>
                        </div>`;
            return table;
        });
        for (let ord of finalTable) {
            finalMsg += await ord;
        }
        let messages = formatMessage("bot", finalMsg, sessionId);
        socket.emit("sendOrder", messages, type);
    } else {
        let botMessage = formatMessage(
            "bot",
            "You have no order history",
            sessionId
        );
        pushMessage(socket, sessionId, botMessage);
    }
    mainMenu = true;
    foodMenu = false;
    sendMenu(socket, sessionId);
    return [mainMenu, foodMenu];
};
const showCurrentOrder = (socket, sessionId, currentOrder) => {
    let type = "current order";
    if (Object.keys(currentOrder.items).length === 0) {
        let botMessage = formatMessage("bot", "You have no order", sessionId);
        pushMessage(socket, sessionId, botMessage);
    } else {
        sendOrderMessage(socket, sessionId, currentOrder, type);
    }
    mainMenu = true;
    foodMenu = false;
    sendMenu(socket, sessionId);
    return [mainMenu, foodMenu];
};
const cancelOrder = (socket, sessionId, currentOrder) => {
    if (Object.keys(currentOrder.items).length === 0) {
        let botMessage = formatMessage("bot", "You have no order", sessionId);
        pushMessage(socket, sessionId, botMessage);
    } else {
        currentOrder.items = {};
        currentOrder.totalPrice = 0;
        let botMessage = formatMessage("bot", "Order canceled", sessionId);
        pushMessage(socket, sessionId, botMessage);
    }
    mainMenu = true;
    foodMenu = false;
    sendMenu(socket, sessionId);
    return [mainMenu, foodMenu];
};

const sendOrderMessage = (socket, sessionId, currentOrder, type, id = "") => {
    let msg = "";
    for (let key in currentOrder.items) {
        msg += `<tr>
                    <td colspan="2">${currentOrder.items[key].item}</td>
                    <td>${currentOrder.items[key].quantity}</td>
                    <td>&#8358;${currentOrder.items[
                        key
                    ].price.toLocaleString()}</td>
                </tr>`;
    }
    msg += `<tr>
                <td colspan="2"></td>
                <td>Total</td>
                <td>&#8358;${currentOrder.totalPrice.toLocaleString()}</td>
            </tr>`;
    let table = `<div class="table">
                    <h1 class="reciept-title">Your Order ${id}</h1>
                    <table class="reciept-table">
                        <thead>
                            <tr>
                                <th colspan="2">Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${msg}
                        </tbody>
                    </table>
                </div>`;
    let messages = formatMessage("bot", table, sessionId);
    socket.emit("sendOrder", messages, type);
};

module.exports = {
    placeOrder,
    checkoutOrder,
    showOrderHistory,
    showCurrentOrder,
    cancelOrder,
    sendOrderMessage,
};
