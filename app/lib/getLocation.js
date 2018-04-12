import { PermissionsAndroid } from 'react-native';

export default function getLocation() {
    return new Promise(async (resolve, reject) => {
        try {
            // see if we have permission to get geolocation
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.SEND_SMS,
                {
                    'title': 'Lucidata Get Geolocation Permission',
                    'message': 'Lucidata needs geolocation permission in order to get directions and weather.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission to get geolocation granted");

                // if geolocation returns successfully, return location
                let onLocationSuccess = (location) => {
                    console.log("location is: ", location);
                    resolve(location);
                }

                // if geolocation fails, return the error
                let onLocationError = (error) => {
                    reject(error);
                }

                // if we have permission, get the current location and perform
                // success or error actions
                navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
            }
            // if we don't have permission, just log that we don't
            else {
                console.log("Geolocation permission denied");
                reject(false);
            }
        } catch (err) {
            console.warn("error from try catch when trying to get location: ", err);
            reject(false)
        }
    });
}
