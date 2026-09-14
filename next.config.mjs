const googleSheetsApiUrl = process.env.GOOGLE_SHEETS_API_URL;

const nextConfig = {
  async rewrites() {
    if (!googleSheetsApiUrl) return [];
    return [
      {
        source: "/sheets-api",
        destination: googleSheetsApiUrl,
      },
    ];
  },
};

export default nextConfig;
