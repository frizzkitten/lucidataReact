export default function parseSms(message) {
    // Messages come in as "w,words in message", where "w" denotes the api
    let splitSms = sms.split(",");
    let api = splitSms[0];
    body = splitSms[1];

    switch(api) {
        case "w":
            console.log("Chose Wikipedia case");
            return "w:" + body;
            break;
        case "s":
            console.log("Chose Sports case");
            return "s:" + body;
            break;
        case "e":
            console.log("Chose Weather case");
            return "e:" + body;
            break;
        default:
            console.log("Hit default case, no api chosen");
    }
    return "";
}
