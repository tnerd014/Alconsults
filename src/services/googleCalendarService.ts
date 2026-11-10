import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Ensure Firebase is initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export interface ConnectedAccount {
  id: string; // email or uid
  email: string;
  displayName: string;
  photoURL?: string;
  accessToken: string;
  expiresAt: number;
  color: string;
  enabled: boolean;
}

export interface UnifiedCalendarItem {
  id: string;
  title: string;
  description?: string;
  startDateTime: string; // ISO or YYYY-MM-DD
  endDateTime?: string;
  isAllDay: boolean;
  category: 'google-event' | 'invoice-due' | 'project-deadline' | 'task-deadline' | 'quotation-expiry';
  sourceAccountEmail?: string;
  sourceAccountColor?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  statusBadge?: string;
  htmlLink?: string;
  amount?: number;
}

const ACCOUNT_COLORS = [
  '#0D5EF4', // Primary Blue
  '#059669', // Emerald
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#D97706', // Amber
  '#0891B2', // Cyan
];

const STORAGE_KEY = 'alconsults_connected_google_calendars_v2';

export function getStoredAccounts(): ConnectedAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load connected calendar accounts:', err);
    return [];
  }
}

export function saveStoredAccounts(accounts: ConnectedAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save connected calendar accounts:', err);
  }
}

/**
 * Connect a Google Account using Firebase Auth with GoogleAuthProvider
 * Using prompt: 'select_account' allows adding multiple different Google accounts!
 */
export async function connectGoogleAccount(): Promise<ConnectedAccount> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (!token) {
    throw new Error('Failed to obtain Google OAuth access token.');
  }

  const user = result.user;
  const existingAccounts = getStoredAccounts();
  const nextColor = ACCOUNT_COLORS[existingAccounts.length % ACCOUNT_COLORS.length];

  const newAccount: ConnectedAccount = {
    id: user.uid || user.email || `acct-${Date.now()}`,
    email: user.email || 'Google Account',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || undefined,
    accessToken: token,
    expiresAt: Date.now() + 3600 * 1000,
    color: nextColor,
    enabled: true,
  };

  // Upsert account
  const updated = existingAccounts.filter((a) => a.email !== newAccount.email);
  updated.push(newAccount);
  saveStoredAccounts(updated);

  return newAccount;
}

/**
 * Disconnect a Google Account from local calendar integration
 */
export function disconnectGoogleAccount(email: string): ConnectedAccount[] {
  const existing = getStoredAccounts();
  const filtered = existing.filter((a) => a.email !== email);
  saveStoredAccounts(filtered);
  return filtered;
}

/**
 * Toggle enable/disable visibility of a connected account's events
 */
export function toggleAccountEnabled(email: string, enabled: boolean): ConnectedAccount[] {
  const existing = getStoredAccounts();
  const updated = existing.map((a) => (a.email === email ? { ...a, enabled } : a));
  saveStoredAccounts(updated);
  return updated;
}

/**
 * Fetch events for a connected account from Google Calendar API
 */
export async function fetchGoogleCalendarEvents(
  account: ConnectedAccount,
  timeMin?: string,
  timeMax?: string
): Promise<UnifiedCalendarItem[]> {
  if (!account.enabled || !account.accessToken) return [];

  const now = new Date();
  const minDate = timeMin || new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const maxDate = timeMax || new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    minDate
  )}&timeMax=${encodeURIComponent(maxDate)}&singleEvents=true&orderBy=startTime&maxResults=100`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      console.warn(`Access token expired for ${account.email}. Please re-authenticate.`);
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Calendar API error (${res.status})`);
  }

  const data = await res.json();
  const items = data.items || [];

  return items.map((ev: any) => {
    const isAllDay = !ev.start?.dateTime && !!ev.start?.date;
    const start = ev.start?.dateTime || ev.start?.date || '';
    const end = ev.end?.dateTime || ev.end?.date;

    return {
      id: `gcal-${account.id}-${ev.id}`,
      title: ev.summary || '(Untitled Event)',
      description: ev.description || '',
      startDateTime: start,
      endDateTime: end,
      isAllDay,
      category: 'google-event',
      sourceAccountEmail: account.email,
      sourceAccountColor: account.color,
      htmlLink: ev.htmlLink,
      statusBadge: ev.status === 'confirmed' ? 'Google Calendar' : ev.status,
    };
  });
}

/**
 * Create a new event in a specific connected Google Account
 */
export async function createGoogleCalendarEvent(params: {
  account: ConnectedAccount;
  summary: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string;
  endTime?: string;
}): Promise<any> {
  const { account, summary, description, startDate, startTime, endDate, endTime } = params;

  let body: any;
  if (startTime) {
    const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endIso = new Date(`${endDate || startDate}T${endTime || startTime}:00`).toISOString();
    body = {
      summary,
      description,
      start: { dateTime: startIso },
      end: { dateTime: endIso },
    };
  } else {
    body = {
      summary,
      description,
      start: { date: startDate },
      end: { date: endDate || startDate },
    };
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Calendar API error (${res.status})`);
  }

  return res.json();
}

/**
 * Delete an event from Google Calendar API with confirmation
 */
export async function deleteGoogleCalendarEvent(
  account: ConnectedAccount,
  eventId: string
): Promise<void> {
  const cleanId = eventId.replace(/^gcal-[^-]+-/, '');
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${cleanId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
    }
  );

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Calendar API error (${res.status})`);
  }
}

