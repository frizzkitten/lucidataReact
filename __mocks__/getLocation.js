const location = {
    coords: {
        latitude: 49.5,
        longitude: 12.4
    }
};

export default function getLocation() {
    return new Promise(async (resolve, reject) => {
        resolve(location);
    });
};
