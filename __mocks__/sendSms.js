
export default function sendSms(messageToSend) {
    return new Promise(async (resolve, reject) => {
        if (messageToSend == "") {
            reject(false);
        } else {
            resolve(true);
        }
    });
};