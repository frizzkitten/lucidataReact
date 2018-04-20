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

export function setWaitingStatus(isWaiting) {
    return {
        type: "SET_WAITING_STATUS",
        isWaiting: isWaiting
    }
}
