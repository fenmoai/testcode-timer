import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not defined');
    } else {
        try {
            // Validation: verify JSON parses
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

/**
 * Updates a specific cell.
 * @param sheetName The name of the sheet (e.g. 'TestCodes')
 * @param rowIndex 1-based row index
 * @param columnIndex 1-based column index (A=1, B=2, etc.)
 * @param value The value to write
 */
export async function updateCell(sheetName: string, rowIndex: number, columnIndex: number, value: string) {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not defined');

    const sheets = await getSheetsClient();
    // Convert 1-based column index to A1 notation helpers could be complex, 
    // but for simple columns we can just map. 
    // Actually, easier to use R1C1 notation or just simple A1 if we know the column letter.
    // However, Sheets API usually takes A1.
    // Let's implement a simple column index to letter converter for standard cases.

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

function getColumnLetter(columnIndex: number): string {
    let temp, letter = '';
    while (columnIndex > 0) {
        temp = (columnIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        columnIndex = (columnIndex - temp - 1) / 26;
    }
    return letter;
}
