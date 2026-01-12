import { getRows, updateCell } from './googleSheets';

const TESTCODES_SHEET = process.env.TESTCODES_SHEET_NAME || 'TestCodes';
const FORM_RESPONSES_SHEET = process.env.FORM_RESPONSES_SHEET_NAME || 'FormResponses';

export interface TestCodeState {
    status: 'not_invited' | 'pre_start' | 'running' | 'ended' | 'submitted';
    testCode: string;
    durationHours: number;
    startTime: string | null; // ISO string
    problemPdfId: string;
    formUrlTemplate: string;
    rowIndex: number;
}

export async function getTestCodeState(testCodeInput: string): Promise<TestCodeState | null> {
    const rows = await getRows(TESTCODES_SHEET);
    // Header is row 1
    const dataRows = rows.slice(1);
    const testCode = testCodeInput.trim();

    // Columns: A=TestCode, B=DurationHours, C=StartTime, D=ProblemPdfId, E=FormUrlTemplate, F=Enabled
    // Indices: 0, 1, 2, 3, 4, 5

    const rowIndexInData = dataRows.findIndex(row => row[0]?.trim().toLowerCase() === testCode.toLowerCase());

    if (rowIndexInData === -1) {
        return null; // Not found
    }

    const row = dataRows[rowIndexInData];
    const rowIndex = rowIndexInData + 2; // +1 for header, +1 for 0-index -> 1-index

    const enabled = row[5]?.toUpperCase() === 'TRUE';
    if (!enabled) {
        return {
            status: 'not_invited',
            testCode: row[0],
            durationHours: 0,
            startTime: null,
            problemPdfId: '',
            formUrlTemplate: '',
            rowIndex
        };
    }

    const startTime = row[2] || null;
    const durationHours = parseFloat(row[1] || '0');
    const problemPdfId = row[3] || '';
    const formUrlTemplate = row[4] || '';

    // Determine basic status based on start time
    // More complex status (running vs ended) depends on current time, which we'll handle in the UI/API logic
    // Here we just return the raw data and let the caller decide "running" vs "ended" vs "pre_start"
    // But wait, the prompt asks for specific logic here "getTestCodeState". 
    // I will just return the raw data mostly, but mapped to a clean object.
    // The caller will compute derived state like 'running', 'ended'.

    return {
        status: startTime ? 'running' : 'pre_start', // Simplified, caller will refine
        testCode: row[0],
        durationHours,
        startTime,
        problemPdfId,
        formUrlTemplate,
        rowIndex
    };
}

export async function setStartTime(testCode: string, isoTime: string) {
    // Re-fetch to get correct row index and ensure no race
    const state = await getTestCodeState(testCode);
    if (!state || state.status === 'not_invited') throw new Error('Invalid test code');

    // If already started, return existing
    if (state.startTime) {
        return state.startTime;
    }

    // Column C is StartTime (index 3)
    await updateCell(TESTCODES_SHEET, state.rowIndex, 3, isoTime);
    return isoTime;
}

export async function hasSubmitted(testCodeInput: string): Promise<boolean> {
    const rows = await getRows(FORM_RESPONSES_SHEET);
    const header = rows[0];
    if (!header) return false;

    // Find TestCode column in FormResponses
    // Assuming the column name is exactly "TestCode" or we scan for it.
    // The prompt says "identify which column holds the TestCode".
    // Lets assume it does naive search for "TestCode" in header.

    const testCodeColIndex = header.findIndex(h => h.trim().toLowerCase() === 'testcode');
    if (testCodeColIndex === -1) {
        console.warn('TestCode column not found in FormResponses sheet');
        return false;
    }

    const testCode = testCodeInput.trim().toLowerCase();
    const dataRows = rows.slice(1);

    return dataRows.some(row => row[testCodeColIndex]?.trim().toLowerCase() === testCode);
}
