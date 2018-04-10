export function addMessages(messages) {
    console.log("in the action creator");
    return {
        type: "ADD_MESSAGES",
        messages: messages
    }
}
