
/**
 * Telegram Bot API Service - Tisa Enterprise
 * این سرویس وظیفه مدیریت ارتباطات زنده با ربات تلگرام را بر عهده دارد.
 */

import { Check, CheckStatus } from "../types";

export const sendTelegramMessage = async (token: string, chatId: string, text: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram Error:', error);
    return { ok: false, error };
  }
};

export const sendTelegramVoice = async (token: string, chatId: string, audioBlob: Blob) => {
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('voice', audioBlob, 'tisa_report.ogg');

    const response = await fetch(`https://api.telegram.org/bot${token}/sendVoice`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram Voice Error:', error);
    return { ok: false, error };
  }
};

/**
 * تولید پیام قالب‌بندی شده برای ثبت چک جدید
 */
export const formatNewCheckMessage = (check: Check, operator: string) => {
  return `
<b>🆕 ثبت چک جدید در سامانه</b>
──────────────────
<b>📌 شماره چک:</b> <code>${check.checkNumber}</code>
<b>💰 مبلغ:</b> <code>${check.amount.toLocaleString('fa-IR')}</code> ریال
<b>🏦 بانک:</b> ${check.bankName}
<b>👤 صادرکننده:</b> ${check.issuerName}
<b>📅 تاریخ سررسید:</b> ${check.dueDate}
<b>📝 وضعیت:</b> ${check.status}
──────────────────
<b>👤 اپراتور:</b> ${operator}
<b>⏰ زمان:</b> ${new Date().toLocaleTimeString('fa-IR')}
  `;
};

/**
 * تولید پیام قالب‌بندی شده برای تغییر وضعیت
 */
export const formatStatusUpdateMessage = (check: Check, oldStatus: CheckStatus, newStatus: CheckStatus, operator: string) => {
  const emoji = newStatus === CheckStatus.CLEARED ? '✅' : newStatus === CheckStatus.BOUNCED ? '🚫' : '🔄';
  return `
<b>${emoji} تغییر وضعیت چک</b>
──────────────────
<b>📌 شماره چک:</b> <code>${check.checkNumber}</code>
<b>👤 صادرکننده:</b> ${check.issuerName}
<b>🏦 بانک:</b> ${check.bankName}

<b>⬅️ از وضعیت:</b> ${oldStatus}
<b>➡️ به وضعیت:</b> <b>${newStatus}</b>
──────────────────
<b>👤 اپراتور:</b> ${operator}
<b>⏰ زمان:</b> ${new Date().toLocaleTimeString('fa-IR')}
  `;
};

/**
 * تولید پیام هشدار سررسید
 */
export const formatAlertMessage = (check: Check, alertType: 'NEAR_DUE' | 'BOUNCED') => {
  const title = alertType === 'NEAR_DUE' ? '⚠️ هشدار سررسید نزدیک' : '🚨 هشدار فوری: چک برگشتی';
  return `
<b>${title}</b>
──────────────────
<b>📌 شماره چک:</b> <code>${check.checkNumber}</code>
<b>💰 مبلغ:</b> <code>${check.amount.toLocaleString('fa-IR')}</code> ریال
<b>🏦 بانک:</b> ${check.bankName}
<b>👤 صادرکننده:</b> ${check.issuerName}
<b>📅 سررسید:</b> <b>${check.dueDate}</b>
──────────────────
<i>لطفاً اقدامات لازم را در اسرع وقت انجام دهید.</i>
  `;
};
