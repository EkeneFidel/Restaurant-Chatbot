require("dotenv").config();
const redis = require("redis");
const client = redis.createClient({
    password: process.env.REDIS_PASSW,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});
(async () => {
    await client.connect();
})();

client.on("connect", function () {
    console.log("Redis Connected!");
});

client.on("error", (err) => {
    console.log("Error in the Redis Connection");
});
module.exports = client;
