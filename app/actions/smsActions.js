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

export function setAwaitingText(awaitingText) {
    return {
        type: "SET_AWAITING_TEXT",
        awaitingText: awaitingText
    }
}

export function setKeyboardShowing(keyboardShowing) {
    return {
        type: "SET_KEYBOARD_SHOWING",
        keyboardShowing: keyboardShowing
    }
}
