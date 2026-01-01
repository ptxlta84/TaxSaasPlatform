const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

// Encrypt string
exports.encrypt = (text) => {
    if (!text) return text;
    try {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    } catch (err) {
        console.error('Encryption error:', err);
        return text; // Fallback to plain if fails (e.g. key missing), though risky ideally should throw
    }
};

// Decrypt string
exports.decrypt = (text) => {
    if (!text) return text;
    try {
        // Basic check if it's hex, otherwise return as is (migration support)
        const encryptedText = Buffer.from(text, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        // If decryption fails (e.g. data wasn't encrypted), return original
        return text;
    }
};
