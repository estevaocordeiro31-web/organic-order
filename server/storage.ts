// Local filesystem storage (replaces Manus Forge Storage)
// Files stored in /uploads directory on VPS

import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
const UPLOADS_URL_PREFIX = process.env.UPLOADS_URL_PREFIX || `${process.env.VITE_API_URL || "http://localhost:3000"}/uploads`;

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "").replace(/\\/g, "/");
}

function getFilePath(relKey: string): string {
  const normalized = normalizeKey(relKey);
  const fullPath = path.join(UPLOADS_DIR, normalized);
  
  // Security: prevent path traversal
  if (!fullPath.startsWith(UPLOADS_DIR)) {
    throw new Error("Invalid file path");
  }
  
  return fullPath;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  try {
    const key = normalizeKey(relKey);
    const filePath = getFilePath(key);
    
    // Create directory if needed
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    fs.writeFileSync(filePath, buffer);
    
    // Generate URL
    const url = `${UPLOADS_URL_PREFIX}/${key}`;
    
    console.log(`[STORAGE] Uploaded: ${key} (${buffer.length} bytes)`);
    
    return { key, url };
  } catch (error) {
    console.error("[STORAGE ERROR]", error);
    throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  try {
    const key = normalizeKey(relKey);
    const filePath = getFilePath(key);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    
    const url = `${UPLOADS_URL_PREFIX}/${key}`;
    
    return { key, url };
  } catch (error) {
    console.error("[STORAGE ERROR]", error);
    throw new Error(`Storage get failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Serve uploaded files via Express middleware
 * Usage in server.ts:
 * 
 * import express from 'express';
 * app.use('/uploads', express.static(UPLOADS_DIR));
 */
export function getUploadsMiddleware() {
  const express = require("express");
  return express.static(UPLOADS_DIR);
}
