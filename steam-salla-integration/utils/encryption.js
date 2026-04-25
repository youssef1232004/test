const crypto = require('crypto');

// Load the 32-byte secret key from the .env file and convert it to a Buffer
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
// AES-256-CBC is the industry standard for secure data encryption
const ALGORITHM = 'aes-256-cbc'; 

// --- ENCRYPT FUNCTION ---
const encryptData = (text) => {
    if (!text) return text;

    // 1. Generate a random 16-byte Initialization Vector (IV) for this specific string
    const iv = crypto.randomBytes(16);
    
    // 2. Create the cipher tool using the algorithm, your secret key, and the IV
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // 3. Encrypt the actual text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 4. Return the IV attached to the encrypted text (separated by a colon).
    // We MUST save the IV with the text so we know how to decrypt it later.
    return iv.toString('hex') + ':' + encrypted;
};

// --- DECRYPT FUNCTION ---
const decryptData = (encryptedText) => {
    if (!encryptedText) return encryptedText;

    // 1. Split the string to separate the IV from the actual encrypted data
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = Buffer.from(textParts.join(':'), 'hex');
    
    // 2. Create the decipher tool using the same algorithm, secret key, and the extracted IV
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // 3. Unscramble the text back to plain English
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

module.exports = { encryptData, decryptData };