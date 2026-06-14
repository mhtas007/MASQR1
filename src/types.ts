export type Role = "ADMIN" | "USER" | "KIOSK";

export type UserCategory = "EMPLOYEE" | "STUDENT" | "TEACHER";

export interface User {
  id: string;
  name: string;
  role: Role;
  category?: UserCategory;
  department: string;
  avatar?: string;
  phone?: string;
  email?: string;
  password?: string;
  deviceId?: string;
}

export type Status = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO Date String
  checkOut: string | null; // ISO Date String
  status: Status;
}

export interface Settings {
  orgName: string;
  lateTime: string; // HH:mm format
  weekendDays?: string[];
  kioskTimeout?: number; // In seconds
  enableSound?: boolean;
  holidays?: { id: string; date: string; name: string }[];
  telegramBotToken?: string;
  telegramChatId?: string;
  enableTelegramNotify?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string; // ISO String
}

export interface AppState {
  users: User[];
  records: AttendanceRecord[];
  activeUserId: string | null;
  settings: Settings;
  auditLogs?: AuditLog[];
}
