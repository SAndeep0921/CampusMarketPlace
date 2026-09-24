const express = require("express");

const app = express();

const server = app.listen(3000);

console.log("Server object created");

server.on("listening", () => {
    console.log("LISTENING EVENT FIRED");
});

server.on("error", (error) => {
    console.log("SERVER ERROR:", error);
});

server.on("close", () => {
    console.log("SERVER CLOSED");
});

setInterval(() => {
    console.log("Checking server...");
}, 3000);