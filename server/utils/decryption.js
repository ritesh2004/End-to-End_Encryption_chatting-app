const forge = require('node-forge');

// -------------- Decrypt --------------

export const decrypt = (encryptedMessage, senderPublicKey) => {
    try {
        const encryptedPackage = JSON.parse(encryptedMessage);
        const encryptedData = forge.util.decode64(encryptedPackage.data);
        let encryptedSymmetricKey = null;
        if (isMe) {
          encryptedSymmetricKey = forge.util.decode64(
            encryptedPackage.senderKey
          );
        } else {
          encryptedSymmetricKey = forge.util.decode64(
            encryptedPackage.recipientKey
          );
        }
        const iv = forge.util.decode64(encryptedPackage.iv);

        const privateKey = forge.pki.privateKeyFromPem(user.privateKey);
        const symmetricKey = privateKey.decrypt(encryptedSymmetricKey);

        const decipher = forge.cipher.createDecipher("AES-CBC", symmetricKey);
        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(encryptedData));
        decipher.finish();

        return decipher.output.toString();
    } catch (error) {
        return null;
    }
};