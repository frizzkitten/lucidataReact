const msgs = [
    "s13Mil;Bos;p",
    "s23Mal;Bos;p",
    "s33Mil;Bod;f;10;5"
];

export default function readTexts() {
    return new Promise((resolve, reject) => {
        resolve(msgs);
    });
};