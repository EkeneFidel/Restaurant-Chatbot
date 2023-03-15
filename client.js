const redis = require("redis");
const client = redis.createClient();
client.connect().catch(console.error);

client.on("connect", function () {
    console.log("Redis Connected!");
});

module.exports = client;
