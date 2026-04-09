export const ENV = {
  appId: process.env.VITE_APP_ID ?? "imaind-experience",
  cookieSecret: process.env.JWT_SECRET ?? "your-secret-key-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "mysql://user:password@localhost:3306/brain",
  isProduction: process.env.NODE_ENV === "production",
  
  // Removed: Manus OAuth, Forge API, Forge Storage
  // These are now handled by:
  // - JWT-based auth (local)
  // - Google Gemini API (direct)
  // - Filesystem storage (local /uploads)
  
  geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY ?? "",
  uploadsDir: process.env.UPLOADS_DIR ?? "./uploads",
  uploadsUrlPrefix: process.env.UPLOADS_URL_PREFIX ?? "http://localhost:3000/uploads",
};
