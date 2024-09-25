// const crypto = require("crypto");

// const msg = "Hello, World!";
// const secret = "abcdefg";

// const hash = crypto.createHmac("sha256", secret).update(msg).digest("hex");

// console.log(hash);
const crypto = require("crypto");

// Define secret key and initialization vector
const secret = "abcdefgabcdefg12"; // 16-byte key for AES-128
const iv = crypto.randomBytes(16);

// Encrypt function
function encrypt(text) {
    const cipher = crypto.createCipheriv("aes-128-cbc", secret, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { iv: iv.toString("hex"), encrypted };
}

// Decrypt function
function decrypt(encryptedText, ivHex) {
    const decipher = crypto.createDecipheriv("aes-128-cbc", secret, Buffer.from(ivHex, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

const msg = "Hello, World!";
const encryptedData = encrypt(msg);
console.log("Encrypted:", encryptedData);

const decryptedMsg = decrypt(encryptedData.encrypted, encryptedData.iv);
console.log("Decrypted:", decryptedMsg);
