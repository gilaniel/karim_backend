const webpush = require("web-push");

const vapidKeys = webpush.generateVAPIDKeys();
console.log("Публичный ключ:", vapidKeys.publicKey);
console.log("Приватный ключ:", vapidKeys.privateKey);
