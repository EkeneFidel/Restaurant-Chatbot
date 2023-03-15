const socket = io();

const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-window");

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit("message", msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

const appendMessage = (messages) => {
    $(".chat-window").append(
        `<div class="${messages.sender} chat-message">
        <p class="meta">${messages.sender} <span>${messages.time}</span></p>
        <p class="text">
            ${messages.info}
        </p>
    </div>`
    );
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

socket.on("createMessage", (messages) => {
    appendMessage(messages);
});

socket.on("bot-message", (messages) => {});

socket.on("user-message", (messages) => {});
