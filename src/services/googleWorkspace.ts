// Google Workspace 1P Integration Service (Gmail, Google Calendar, Google Drive, Google Sheets)
// Uses Google Identity Services (GIS) implicit token flow on the client

declare global {
  interface Window {
    google?: any;
  }
}

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');

let cachedAccessToken: string | null = null;
let tokenExpiryTimestamp = 0;

export function getGoogleWorkspaceTokenStatus(): { isConnected: boolean; token: string | null } {
  const isValid = !!cachedAccessToken && Date.now() < tokenExpiryTimestamp;
  return { isConnected: isValid, token: isValid ? cachedAccessToken : null };
}

export function requestGoogleWorkspaceToken(promptConsent = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!promptConsent && cachedAccessToken && Date.now() < tokenExpiryTimestamp) {
      resolve(cachedAccessToken);
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID is not configured in the environment.'));
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services script is still loading. Please try again in a moment.'));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: WORKSPACE_SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        cachedAccessToken = response.access_token;
        const expiresInSec = Number(response.expires_in) || 3500;
        tokenExpiryTimestamp = Date.now() + expiresInSec * 1000;
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: promptConsent ? 'consent' : '' });
  });
}

// Helper to encode UTF-8 strings to base64url for Gmail API
function toBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.byteLength; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 1. Gmail API: Send an email directly from the user's connected Google Workspace / Gmail account
 */
export async function sendEmailViaGmailApi(params: {
  to: string;
  cc?: string;
  subject: string;
  body: string;
}): Promise<{ id: string; threadId: string }> {
  const token = await requestGoogleWorkspaceToken();

  const headers = [
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : '',
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
  ]
    .filter(Boolean)
    .join('\r\n');

  const rawMime = `${headers}\r\n\r\n${params.body}`;
  const encodedMessage = toBase64Url(rawMime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gmail API error (${res.status})`);
  }

  return res.json();
}

/**
 * 2. Google Calendar API: Create a calendar event for a Project Milestone or Invoice Due Date
 */
export async function syncEventToGoogleCalendar(params: {
  summary: string;
  description: string;
  date: string; // YYYY-MM-DD
}): Promise<{ id: string; htmlLink: string }> {
  const token = await requestGoogleWorkspaceToken();

  const startDateTime = new Date(`${params.date}T09:00:00`).toISOString();
  const endDateTime = new Date(`${params.date}T10:00:00`).toISOString();

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: params.summary,
      description: params.description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Calendar API error (${res.status})`);
  }

  return res.json();
}

/**
 * 3. Google Drive API: Archive an Invoice or Commercial Proposal HTML document to Google Drive
 */
export async function saveDocumentToGoogleDrive(params: {
  fileName: string;
  htmlContent: string;
}): Promise<{ id: string; name: string; webViewLink?: string }> {
  const token = await requestGoogleWorkspaceToken();

  const metadata = {
    name: params.fileName,
    mimeType: 'text/html',
  };

  const boundary = 'aiconsults_drive_multipart_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    params.htmlContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Drive API error (${res.status})`);
  }

  return res.json();
}

/**
 * 4. Google Sheets API: Export live Financial Ledger (Invoices, Payments & Expenses) to a new Google Sheet
 */
export async function exportLedgerToGoogleSheets(params: {
  title: string;
  rows: (string | number)[][];
}): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await requestGoogleWorkspaceToken();

  // Step 1: Create the spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: params.title },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google Sheets API error (${createRes.status})`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl = created.spreadsheetUrl;

  // Step 2: Populate rows into Sheet1!A1
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Sheet1!A1',
        majorDimension: 'ROWS',
        values: params.rows,
      }),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
}
