const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

const getKey = () => process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : null;
const getIV = () => process.env.ENCRYPTION_IV ? Buffer.from(process.env.ENCRYPTION_IV, 'hex') : null;

// Encrypt string
exports.encrypt = (text) => {
    if (!text) return text;
    const key = getKey();
    const iv = getIV();
    if (!key || !iv) {
        console.error('Encryption skipped: Missing ENCRYPTION_KEY or ENCRYPTION_IV');
        return text;
    }
    try {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    } catch (err) {
        console.error('Encryption error:', err);
        return text;
    }
};

// Decrypt string
exports.decrypt = (text) => {
    if (!text) return text;
    const key = getKey();
    const iv = getIV();
    if (!key || !iv) return text;
    
    try {
        const encryptedText = Buffer.from(text, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        return text;
    }
};
