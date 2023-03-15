const {
    placeOrder,
    checkoutOrder,
    orderHistory,
    currentOrder,
    cancelOrder,
} = require("./order");

const menuItems = require("./menu-items.json");

const takeUserPrompt = (userPrompt) => {
    switch (userPrompt) {
        case 1:
            placeOrder();
            break;
        case 99:
            checkoutOrder();
            break;
        case 98:
            orderHistory();
            break;
        case 97:
            currentOrder();
            break;
        case 0:
            cancelOrder();
            break;
        default:
        // code block
    }
};
