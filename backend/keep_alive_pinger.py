"""
OceanLens 24/7 Keep-Alive Pinger Script

This standalone script keeps the Render-hosted OceanLens FastAPI backend awake 24/7.
Render free-tier instances sleep after 15 minutes of inactivity.
This script pings the service every 9 minutes so it never enters sleep mode.

Usage:
    python keep_alive_pinger.py
    python keep_alive_pinger.py --interval 540 --url https://oceanlens-backend.onrender.com
"""

import argparse
import sys
import time
from datetime import datetime, timezone
import urllib.request
import urllib.error


def ping(url: str, timeout: int = 45) -> bool:
    target = url.rstrip("/")
    if not (target.endswith("/health") or target.endswith("/keep-alive")):
        target = f"{target}/health"

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"[{timestamp}] Pinging {target}...", end=" ", flush=True)

    try:
        req = urllib.request.Request(
            target,
            headers={
                "User-Agent": "OceanLens-KeepAlive-Worker/1.0",
                "Accept": "application/json",
            },
        )
        start_t = time.time()
        with urllib.request.urlopen(req, timeout=timeout) as response:
            duration = time.time() - start_t
            status = response.getcode()
            body = response.read().decode("utf-8", errors="replace")
            print(f"HTTP {status} OK ({duration:.2f}s) -> {body.strip()}")
            return True
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return False
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")
        return False
    except Exception as e:
        print(f"Failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="OceanLens 24/7 Keep-Alive Daemon")
    parser.add_argument(
        "--url",
        default="https://oceanlens-backend.onrender.com",
        help="Base URL of OceanLens Backend (default: https://oceanlens-backend.onrender.com)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=540,
        help="Ping interval in seconds (default: 540s / 9 minutes)",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run once and exit immediately (useful for cron jobs)",
    )

    args = parser.parse_args()

    print("=" * 60)
    print(" OceanLens 24/7 Keep-Alive Daemon")
    print(f" Target: {args.url}")
    print(f" Interval: {args.interval}s ({args.interval / 60:.1f} minutes)")
    print("=" * 60)

    if args.once:
        success = ping(args.url)
        sys.exit(0 if success else 1)

    while True:
        ping(args.url)
        print(f"Sleeping for {args.interval}s until next keep-alive probe...\n")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
