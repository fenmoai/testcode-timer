# TestCode Timer

A minimal, production-ready web app for timed candidate tests.

## Features

- **TestCode Login**: No accounts, just a unique code.
- **Timed Access**: Candidates can only access the problem within the `start -> start + duration` window.
- **Google Sheets Backend**: Manage candidates and codes via a simple spreadsheet.
- **Google Drive PDF**: Securely display problem statements without direct download links.
- **Automated Submission Handling**: Redirects to Google Forms and blocks re-submissions.

## Setup

### 1. Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Sheets API**.
3. Create a **Service Account** and download the JSON key.
4. Share your Google Sheet and Google Drive Folder with the Service Account email.

### 2. Sheet Structure

Create a Google Sheet with two tabs: `TestCodes` and `FormResponses`.

**`TestCodes` Columns:**

1. `TestCode` (e.g., "TEST123")
2. `DurationHours` (e.g., "2")
3. `StartTime` (Leave empty; app writes this)
4. `ProblemPdfId` (Google Drive File ID)
5. `FormUrlTemplate` (Google Form link with `__TESTCODE__` placeholder)
6. `Enabled` (TRUE/FALSE)

**`FormResponses`:**

- Ensure one column captures the `TestCode`.

### 3. Environment Variables

Create `.env.local` (or set in Vercel):

```bash
GOOGLE_SERVICE_ACCOUNT_JSON='{ ...your_json_here... }'
GOOGLE_SHEET_ID='your_spreadsheet_id'
TESTCODES_SHEET_NAME='TestCodes'
FORM_RESPONSES_SHEET_NAME='FormResponses'
```

### 4. Running Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deployment (Vercel)

1. Push to GitHub.
2. Import project in Vercel.
3. Add the Environment Variables.
4. Deploy!

## Usage

1. Add a candidate row to `TestCodes` with `Enabled=TRUE`.
2. Send the candidate their `TestCode` and the link.
3. Candidate logs in, starts test, and sees PDF.
4. Timer ends -> Candidate submits form.
