import { google } from 'googleapis';
import { getAuth } from './googleSheets';
import { Readable } from 'stream';

export async function getDriveClient() {
    const auth = getAuth();
    return google.drive({ version: 'v3', auth });
}

export async function uploadFile(
    fileName: string,
    mimeType: string,
    content: Buffer
): Promise<string> {
    const drive = await getDriveClient();
    const folderId = process.env.DRIVE_FOLDER_ID;

    if (!folderId) {
        throw new Error('DRIVE_FOLDER_ID is not defined');
    }

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType,
        body: Readable.from(content),
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
    });

    return response.data.webViewLink || '';
}
