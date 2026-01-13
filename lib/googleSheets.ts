import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive', // Added drive scope for file uploads
];

export function getAuth() {
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not defined');
    } else {
        try {
            JSON.parse(serviceAccount);
        } catch (e) {
            throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
        }
    }

    return new google.auth.GoogleAuth({
        credentials: JSON.parse(serviceAccount),
        scopes: SCOPES,
    });
}

export async function getSheetsClient() {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
}

export async function getRows(sheetName: string): Promise<string[][]> {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not defined');

    const sheets = await getSheetsClient();
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: sheetName,
        });
        return response.data.values || [];
    } catch (error: any) {
        console.error(`Error reading sheet "${sheetName}" from spreadsheet "${sheetId}":`, error.message);
        if (error.code === 404) {
            throw new Error(`Google Sheet not found. Please check GOOGLE_SHEET_ID ('${sheetId}') and TESTCODES_SHEET_NAME ('${sheetName}'). Ensure the sheet tab name matches exactly.`);
        }
        throw error;
    }
}

export async function updateCell(sheetName: string, rowIndex: number, columnIndex: number, value: string) {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not defined');

    const sheets = await getSheetsClient();
    const columnLetter = getColumnLetter(columnIndex);
    const range = `${sheetName}!${columnLetter}${rowIndex}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[value]],
        },
    });
}

export async function appendRow(sheetName: string, values: string[]) {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not defined');

    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [values],
        },
    });
}

function getColumnLetter(columnIndex: number): string {
    let temp, letter = '';
    while (columnIndex > 0) {
        temp = (columnIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        columnIndex = (columnIndex - temp - 1) / 26;
    }
    return letter;
}
