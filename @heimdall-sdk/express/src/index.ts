import type { NextFunction, Request, Response } from "express";
import { buildLog, type LogEntry } from "./entry.dto.js";

export interface LoggerOptions {
  enabled?: boolean;
  includeBody?: boolean;
  baseUrl: string;
  serviceName: string;
  apiKey: string;
  flushIntervalMs?: number;
  flushSize?: number;
}
export function heimdall(options: LoggerOptions) {
  const {
    enabled = true,
    includeBody = false,
    apiKey,
    baseUrl,
    serviceName,
    flushIntervalMs = 10_000,
    flushSize = 50,
  } = options;

  if (!baseUrl) {
    console.warn("[heimdall-sdk] baseUrl is required.");
  }

  const flusher = createBufferFlusher(
    baseUrl,
    apiKey,
    flushSize,
    flushIntervalMs
  );

  return (req: Request, res: Response, next: NextFunction) => {
    if (!enabled) return next();

    const start = Date.now();

    res.on("finish", () => {
      if (!baseUrl) return;

      const duration = Date.now() - start;

      const entry = buildLog(req, res, duration, includeBody, serviceName);

      flusher.add(entry);
    });

    next();
  };
}

async function sendEntry(baseUrl: string, apiKey: string, entry: LogEntry) {
  try {
    await fetch(`${baseUrl}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    console.error("[heimdall-sdk] failed to send log:", err);
  }
}

function createBufferFlusher(
  baseUrl: string,
  apiKey: string,
  flushSize: number,
  flushIntervalMs: number
) {
  let buffer: LogEntry[] = [];
  let flushing = false;

  const flushBuffer = async () => {
    if (flushing) return;
    if (buffer.length === 0) return;

    flushing = true;

    const toSend = [...buffer];
    buffer = [];

    for (const entry of toSend) {
      await sendEntry(baseUrl, apiKey, entry);
    }

    flushing = false;
  };

  setInterval(() => flushBuffer(), flushIntervalMs);

  const add = (entry: LogEntry) => {
    buffer.push(entry);
    if (buffer.length >= flushSize) {
      flushBuffer();
    }
  };

  return { add };
}
