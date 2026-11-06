#!/usr/bin/env python3
"""
site_settings ka `analytics` row — test ke liye saaf karne ka chhota tool.

🔴 Yahan SIRF `clear` hai, `set` jaan boojh kar nahi rakha.
DB me seedha row likhne se static page nahi badalte (wo build ke waqt ban
chuke hote hain), isliye waisa test jhootha PASS/FAIL deta hai. Setting
badalne ka asli raasta admin API hai — wahi `analytics-tag-browser.mjs`
use karta hai.

site_settings ka shape schema.prisma se naapa gaya hai, andaaz se nahi:
  key String @id @db.VarChar(80) · value Json · updatedAt -> updated_at

Usage: python3 scripts/analytics-row.py clear
"""
import sys

import psycopg

DSN = "postgresql://postgres@localhost:5432/aqn"

if len(sys.argv) < 2 or sys.argv[1] != "clear":
    print("usage: analytics-row.py clear")
    sys.exit(2)

conn = psycopg.connect(DSN, autocommit=True)
cur = conn.execute("delete from site_settings where key = 'analytics'")
print(f"  (db) analytics row cleared ({cur.rowcount} row)")
