
export enum CheckStatus {
  PENDING = 'در انتظار',
  NEAR_DUE = 'نزدیک به سررسید',
  CLEARED = 'وصول شده',
  BOUNCED = 'برگشتی',
  VOIDED = 'باطل شده'
}

export interface CheckHistoryEntry {
  id: string;
  fromStatus: CheckStatus | 'ثبت اولیه';
  toStatus: CheckStatus;
  timestamp: string;
  userId: string;
}

export interface Check {
  id: string;
  checkNumber: string;
  amount: number;
  bankName: string;
  issuerName: string;
  receiverName: string;
  issueDate: string; 
  dueDate: string;   
  status: CheckStatus;
  createdAt: string;
  history: CheckHistoryEntry[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  autoReminders: boolean;
  dailyReports: boolean;
  voiceAlerts: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'OPERATOR';
  isTwoFactorEnabled: boolean;
  telegram?: TelegramConfig;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  isRead: boolean;
  link?: string;
}
