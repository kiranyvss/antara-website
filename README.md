# Antara Website + Google Sheets Appointments

This version uses the existing Next.js/Vercel website and Google Sheets + Google Apps Script for counsellor availability and appointments. No separate FastAPI server, Render, Railway or PostgreSQL service is required.

## Production architecture

Browser → Vercel Next.js → `/sheets-api` rewrite → Google Apps Script → Google Sheet

The Google Sheet is the admin area. Use the `Availability` tab to control counsellor working hours, `Leave` for counsellor leave, `Holidays` for clinic holidays and `Appointments` for bookings.

## Required Vercel environment variable

`GOOGLE_SHEETS_API_URL` = your deployed Google Apps Script Web App `/exec` URL.

Optional:

`NEXT_PUBLIC_GOOGLE_SHEET_URL` = the Google Sheet URL for the `/admin` helper page.

## Setup

See `GOOGLE_SHEETS_SETUP.md` for the complete step-by-step setup.
