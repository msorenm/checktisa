
/**
 * Tisa Secure Storage Service - Stable Edition
 * مدیریت رمزنگاری و پایداری مطلق داده‌ها
 */

const SECRET_SALT = "TISA_ULTIMATE_v3_2025";

const encrypt = (text: string): string => {
  return btoa(encodeURIComponent(text).split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length))
  ).join(''));
};

const decrypt = (encoded: string): string => {
  try {
    const decoded = atob(encoded);
    const decrypted = decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length))
    ).join('');
    return decodeURIComponent(decrypted);
  } catch (e) {
    return "";
  }
};

export const SecureDB = {
  save: (key: string, data: any) => {
    if (data === null || data === undefined) return;
    const jsonString = JSON.stringify(data);
    const encryptedData = encrypt(jsonString);
    localStorage.setItem(`_tisa_vault_${key}`, encryptedData);
  },

  load: (key: string): any => {
    const encryptedData = localStorage.getItem(`_tisa_vault_${key}`);
    if (!encryptedData) return null;
    const decryptedString = decrypt(encryptedData);
    try {
      return decryptedString ? JSON.parse(decryptedString) : null;
    } catch (e) {
      console.error("Decryption failed for key:", key);
      return null;
    }
  },

  // فقط سشن را پاک می‌کند، نه کل دیتابیس را
  clearSession: () => {
    localStorage.removeItem('_tisa_vault_auth_status');
    // اطلاعات کاربر و چک‌ها دست‌نخورده باقی می‌مانند
  },

  // برای پاکسازی کامل در موارد اضطراری
  factoryReset: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('_tisa_vault_')) localStorage.removeItem(key);
    });
  }
};
