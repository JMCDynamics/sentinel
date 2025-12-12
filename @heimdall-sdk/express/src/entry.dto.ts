import type { Request, Response } from "express";

export type LogEntry = {
  serviceName: string;
  timestamp: number;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip: string;
  userAgent?: string | string[] | undefined;
  query: Record<string, any>;
  params: Record<string, any>;
  headers: Record<string, any>;
  body?: any;
};

export function buildLog(
  req: Request,
  res: Response,
  duration: number,
  includeBody: boolean,
  serviceName: string
): LogEntry {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  return {
    serviceName,
    timestamp: Date.now(),
    method: req.method,
    url: fullUrl,
    statusCode: res.statusCode,
    duration,
    ip: req.socket.remoteAddress || req.ip || "",
    userAgent: req.headers["user-agent"],
    query: req.query ?? {},
    params: req.params ?? {},
    headers: req.headers ?? {},
    body: includeBody ? req.body : undefined,
  };
}
