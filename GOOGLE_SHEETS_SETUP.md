# Antara — Google Sheets Appointment Setup (₹0 additional hosting)

This version removes the FastAPI/SQLite dependency. The live appointment scheduler uses one Google Sheet and one Google Apps Script Web App.

## 1. Create the Google Sheet

Create a new Google Sheet named `Antara Appointment Management`.

You do **not** need to create the six tabs manually. After pasting the Apps Script in Step 2, run the included `setupAntaraSheet` function once; it creates and seeds the tabs for you. The tab structure is documented below so you know what each sheet is for.

### Counsellors

`id | name | qualifications | specializations | feePerHour | detailedInfo | photo | active | timezone`

Paste the existing counsellors as rows. Example:

`S001 | Meenakshi Yellapragada | M.A. Clinical Psychology / Certified Cognitive Behavioral Therapist | Anxiety Disorders / Depression / Stress Management | 450 | ... | /staff-photos/Meenakshi.jpg | TRUE | Asia/Kolkata`

Use one cell for each column. For line breaks in qualifications/specializations, use Alt+Enter inside the cell if desired.

### Availability

`counsellor_id | weekday | start_time | end_time | active`

`weekday` is Monday=0, Tuesday=1, ... Sunday=6.

Example:

`S001 | 0 | 09:00 | 13:00 | TRUE`
`S001 | 0 | 14:00 | 18:00 | TRUE`
`S001 | 1 | 09:00 | 13:00 | TRUE`
`S001 | 1 | 14:00 | 18:00 | TRUE`

This is the main sheet you will edit to control counsellor availability.

### Leave

`counsellor_id | date | start_time | end_time | reason`

For full-day leave, leave start_time and end_time blank.

### Holidays

`date | name`

### AppointmentTypes

`id | name | duration_minutes | active`

Use:

`1 | Individual Counselling | 60 | TRUE`
`2 | Student Support | 60 | TRUE`
`3 | Anxiety & Stress Management | 60 | TRUE`
`4 | Parent Guidance | 60 | TRUE`
`5 | Self Growth | 60 | TRUE`
`6 | Added for testing purposes | 60 | TRUE`

### Appointments

`id | date | start_time | end_time | counsellor_id | client_name | client_age | client_gender | client_phone | client_email | appointment_type_id | appointment_type | status | created_at`

Leave this sheet empty after adding the header row. New client bookings will be appended automatically.

## 2. Add the Apps Script

In the Google Sheet, open **Extensions → Apps Script**.

Delete the sample code and paste the complete contents of `google_apps_script_Code.gs` from this ZIP.

At the top, replace:

`PASTE_GOOGLE_SHEET_ID_HERE`

with your Google Sheet ID. The Sheet ID is the long string between `/d/` and `/edit` in the Google Sheet URL.

Click **Save**. In the function selector, choose `setupAntaraSheet` and click **Run** once. Google will ask for permission; review it and allow the script to access this spreadsheet. The six tabs and starter data will be created.

## 3. Deploy as a Web App

In Apps Script choose **Deploy → New deployment**.

Select:

- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**

Click **Deploy** and copy the Web app URL ending in `/exec`.

Keep this URL private from ordinary users where possible, although the booking API itself must be reachable by the website.

## 4. Connect the Vercel website

In the Vercel project `antara-website`, add this Environment Variable:

`GOOGLE_SHEETS_API_URL = https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

Use the exact `/exec` URL from Apps Script.

Redeploy the Vercel project after adding the variable.

## 5. Optional Admin page link

Set this Vercel variable if you want the `/admin` page's **Open Google Sheet** button to open your management sheet:

`NEXT_PUBLIC_GOOGLE_SHEET_URL = https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

The `/admin` page is now an admin guide rather than a password-protected API console. Your Google account permissions protect the actual Sheet, which is where availability, leave, holidays and appointments are managed.

## 6. How to add counsellor hours

Open the **Availability** tab.

For Monday 10 AM–1 PM and 2 PM–6 PM for S001, add:

`S001 | 0 | 10:00 | 13:00 | TRUE`
`S001 | 0 | 14:00 | 18:00 | TRUE`

For Tuesday 9 AM–5 PM:

`S001 | 1 | 09:00 | 17:00 | TRUE`

Save the sheet. The client booking page will use these hours automatically.

## 7. Important safety/privacy notes

- Restrict Google Sheet sharing to authorised staff.
- Do not put therapy notes, diagnoses or other clinical records in the spreadsheet.
- The Appointments sheet should contain only information needed for scheduling.
- Back up the spreadsheet periodically.
- If you later need high-volume bookings, automated reminders, staff accounts, audit logs or stronger security, a proper backend/database can be added later.

## 8. No old backend deployment is required

For this version, you do NOT deploy the `backend` folder anywhere.
