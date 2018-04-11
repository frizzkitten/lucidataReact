// export default function parseSms(message) {
//     // Messages come in as "w,words in message", where "w" denotes the api
//     let splitSms = sms.split(",");
//     let api = splitSms[0];
//     body = splitSms[1];
//
//     switch(api) {
//         case "w":
//             console.log("Chose Wikipedia case");
//             return "w:" + body;
//             break;
//         case "s":
//             console.log("Chose Sports case");
//             return "s:" + body;
//             break;
//         case "e":
//             console.log("Chose Weather case");
//             return "e:" + body;
//             break;
//         default:
//             console.log("Hit default case, no api chosen");
//     }
//     return "";
// }

export default function parseSms(message) {
    if (typeof message === "string" && message.length > 0) {
        // remove twilio trial account message if it exists
        let twilioTrialAccountMessage = "Sent from your Twilio trial account - ";
        if (message.includes(twilioTrialAccountMessage)) {
            message = message.substring(twilioTrialAccountMessage.length);
        }

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
