const msgs = [
    {api: "sports", data: "sMil;Bos;p"},

];

export default function readTexts() {
    return new Promise((resolve, reject) => {
        resolve(msgs);
    });
};