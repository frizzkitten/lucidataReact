import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';

export default function sendSms(messageToSend) {
    return new Promise(async (resolve, reject) => {
        const PRODUCTION_NUMBER = '3312156629';
        const AUSTIN_NUMBER = '9522502550';

        try {
            // see if we have permission to send a text
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.SEND_SMS,
                {
                    'title': 'Lucidata Send SMS Permission',
                    'message': 'Lucidata needs SMS permission in order to communicate with the server.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission to send sms granted");

                // if we have permission, send the text
                SmsAndroid.sms(
                    AUSTIN_NUMBER, // phone number to send sms to
                    messageToSend, // sms body
                    'sendDirect', // sendDirect or sendIndirect
                    (err, message) => {
                        if (err){
                            console.log("error: ", err);
                            reject(false);
                        } else {
                            // text successfully send
                            console.log("callback message: ", message); // callback message
                            resolve(true);
                        }
                    }
                );
            }
            // if we don't have permission, just log that we don't
            else {
                console.log("SMS permission denied");
                reject(false);
            }
        } catch (err) {
            console.warn("error from try catch: ", err);
            reject(false)
        }
    });
}
