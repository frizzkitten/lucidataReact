export function setMessages(messages) {
    return {
        type: "SET_MESSAGES",
        messages: messages
    }
}

export function addMessage(message) {
    return {
        type: "ADD_MESSAGE",
        message: message
    }
}
