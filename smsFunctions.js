export function parseText(message) {
    if (typeof message === "string" && message.length > 0) {
        // the first letter of the message determines which api it is for
        let apiChar = message.charAt(0);
        const COMMA_INDEX = 1;
        switch (apiChar) {
            // using wikipedia api
            case "w":
                let info = "No info found about that topic :(";
                // if the message has info in it, return that info
                if (message.length > COMMA_INDEX + 1) {
                    info = message.substring(COMMA_INDEX);
                }
                return {api: "wikipedia", info: info};
                break;
            default:
                return {api: "not found"};
                break;
        }

    }
    // if the message to parse is not a valid message, return error string
    else {
        return {api: "not found"};
    }
}
