#!/usr/bin/env python3
"""Local static server with Cache-Control: no-store (avoids stale ES modules)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("", PORT), NoCacheHandler)
    print(f"Serving Minnesota Portage at http://localhost:{PORT}/ (no-cache)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
