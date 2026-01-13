# Google Cloud & Environment Setup Guide

Follow these steps to configure your environment variables while adhering to the **Principle of Least Privilege**.

## 1. Google Cloud Project Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project** (e.g., `testcode-timer-production`).
3. Select the project.

## 2. Enable APIs

1. Search for **"Google Sheets API"** in the top search bar.
2. Click **Enable**.
   * *Note: You do NOT need to enable the Drive API if you are only embedding the PDF via iframe, but enabling it doesn't hurt.*

## 3. Create Service Account (Least Privilege)

This account will represent your "App".

1. Go to **IAM & Admin** > **Service Accounts**.
2. Click **Create Service Account**.
3. **Name**: e.g., `testcode-runner`.
4. **Grant this service account access to project**: **SKIP THIS STEP**.
   * *Critical for Least Privilege: Do not grant Project-level roles like "Owner" or "Editor". The account starts with NO access.*
5. **Done**.

## 4. Generate Credentials (JSON)

1. Click on the newly created Service Account (email looks like `testcode-runner@project-id.iam.gserviceaccount.com`).
2. Go to the **Keys** tab.
3. Click **Add Key** > **Create new key**.
4. Select **JSON**. The file will download automatically.
   > [!NOTE]
   > Google will show a warning: *"Service account keys could pose a security risk..."* and recommend **Workload Identity Federation**.
   >
   > **Why we use Keys here:** Workload Identity is designed for apps running *inside* Google Cloud (or advanced setups with AWS/Azure). Since we are deploying to **Vercel**, using a Service Account Key (stored securely in Environment Variables) is the standard and simplest approach.
   >
   > **Mitigation:** We mitigate the risk by:
   > 1. Giving the account **NO** project-level permissions.
   > 2. Only sharing the specific Sheet with it.
   > 3. Never committing the key to Git.

5. **Secure this file**. Its content is your `GOOGLE_SERVICE_ACCOUNT_JSON`.
   * *Copy the entire file content, minify it (remove newlines) if needed for some env/providers, or use it as is.*

## 5. Share Resources (Granting Access)

Instead of giving the Service Account access to *everything*, share *only* the specific resources it needs.

### A. The Google Sheet

1. Open your Google Sheet (`TestCodes`).
2. **Setup Columns (Row 1):**
   * **A: `TestCode`** (e.g., "TEST123")
   * **B: `DurationHours`** (e.g., "2")
   * **C: `StartTime`** (Leave blank; app writes this)
   * **D: `ProblemPdfId`** (File ID from Google Drive)
   * **E: `FormUrlTemplate`** (Form link with `__TESTCODE__` at the end)
   * **F: `Enabled`** (TRUE/FALSE)
3. Click **Share**.
4. Paste the **Service Account Email** (`testcode-runner@...`).
5. Set permission to **Editor**.
   * *Why Editor? The app needs to write the `StartTime` to the sheet.*
6. Uncheck "Notify people" (optional).
7. Click **Share**.

### B. The PDF (Drive)

1. Open the PDF in Google Drive.
2. **Access Setting**:
    * Since the App uses an iframe to display the PDF to *unauthenticated candidates*, the Service Account cannot proxy this view in the current implementation.
    * **Action**: Share -> General Access -> **"Anyone with the link"** -> **"Viewer"**.
3. **Restrict Download** (Security):
    * Click the **Settings (gear icon)** in the Share dialog.
    * **Uncheck**: "Viewers and commenters can see the option to download, print, and copy".
    * This hides the UI buttons, preventing easy removal.

## 6. Get IDs for Environment Variables

### `GOOGLE_SERVICE_ACCOUNT_JSON`

The content of the JSON file you downloaded in Step 4.

### `GOOGLE_SHEET_ID`

Open your Spreadsheet URL:
`https://docs.google.com/spreadsheets/d/1aBcD_ExAmP1E_ThisIsTheID_xYz/edit`
The ID is the long string between `d/` and `/edit`.

### `TESTCODES_SHEET_NAME`

The name of the tab at the bottom of your sheet (e.g., `Sheet1` or rename to `TestCodes`).

### `FORM_RESPONSES_SHEET_NAME`

The name of the tab receiving form responses (e.g., `Form Responses 1`).

### `DRIVE_FOLDER_ID`

The ID of the Google Drive folder where submission images will be uploaded. See Section 7 for details.

---

## Summary of Permissions

* **Project Role**: None.

* **Sheet Access**: Editor (Explicitly shared).
* **Drive Access**: Public Viewer (Restricted download).
* **Service Account**: Only authenticated to read/write the specific Sheet.

## 7. How to Get Specialized IDs

### How to get `ProblemPdfId`

1. Open your PDF file in Google Drive.
2. Look at the URL in your browser address bar.
3. It looks like: `https://drive.google.com/file/d/1XyZ_AbCdEfGnHiJkLmNoPqRsTvUy/view`
4. Copy the ID part: **`1XyZ_AbCdEfGnHiJkLmNoPqRsTvUy`**.
   * *Example in Sheet*: `1XyZ_AbCdEfGnHiJkLmNoPqRsTvUy`

### How to get `FormUrlTemplate`

1. Open your Google Form in edit mode.
2. Click the **three dots** (top right) > **Get pre-filled link**.
3. In the "TestCode" answer field, type exactly: **`__TESTCODE__`**.
4. Click **Get Link**.
5. Copy the link. It will look like this:
   `https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform?usp=pp_url&entry.123456=__TESTCODE__`
6. Paste this full URL into the `FormUrlTemplate` column in your sheet.
   * *Example in Sheet*: `https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform?usp=pp_url&entry.123456=__TESTCODE__`

### How to get `DRIVE_FOLDER_ID` (For Image Uploads)

1. Go to Google Drive and create a **New Folder** (e.g., `TestCode Submissions`).
2. **Share this folder**:
   * Right-click > Share.
   * Add the **Service Account Email**.
   * Set permission to **Editor** (It needs to upload files).
3. Open the folder.
4. Look at the URL: `https://drive.google.com/drive/folders/12345abcde_FolderID_xyz`
5. Copy the ID part: **`12345abcde_FolderID_xyz`**.
6. Add this to your `.env.local`: `DRIVE_FOLDER_ID='12345abcde_FolderID_xyz'`
