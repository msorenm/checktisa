
/**
 * Tisa Secure Storage Service
 * مدیریت رمزنگاری و پایداری داده‌ها در لایه کلاینت
 */

// یک کلید نمادین برای رمزنگاری (در دنیای واقعی از کلید مشتق شده استفاده می‌شود)
const SECRET_SALT = "TISA_SECURE_v2_2025";

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
    const jsonString = JSON.stringify(data);
    const encryptedData = encrypt(jsonString);
    localStorage.setItem(`_tisa_${key}`, encryptedData);
  },

  load: (key: string): any => {
    const encryptedData = localStorage.getItem(`_tisa_${key}`);
    if (!encryptedData) return null;
    const decryptedString = decrypt(encryptedData);
    try {
      return decryptedString ? JSON.parse(decryptedString) : null;
    } catch (e) {
      return null;
    }
  },

  clear: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('_tisa_')) localStorage.removeItem(key);
    });
  }
};
