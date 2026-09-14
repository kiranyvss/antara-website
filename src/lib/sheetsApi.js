export const SHEETS_API = "/sheets-api";

export async function sheetsGet(params) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${SHEETS_API}?${query}`, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || "Google Sheets service is unavailable.");
  return data;
}

export async function sheetsPost(payload) {
  const response = await fetch(SHEETS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || "Could not book the appointment.");
  return data;
}
