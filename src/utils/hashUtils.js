import CryptoJS from 'crypto-js';

/**
 * Reads a File object and returns its SHA256 hash.
 * @param {File} file
 * @returns {Promise<string>}
 */
export const calculateFileHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
        const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    // Need array buffer for accurate binary hashing
    reader.readAsArrayBuffer(file);
  });
};
