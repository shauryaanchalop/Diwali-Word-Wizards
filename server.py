"""
Word Wizards Diwali Celebration • Persistent Local Server
Serves static web files and provides real-time persistent wish storage via /api/wishes.
"""

import http.server
import json
import os
import socketserver
import sys

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WISHES_FILE = os.path.join(BASE_DIR, "wishes.json")

def load_wishes():
    if os.path.exists(WISHES_FILE):
        try:
            with open(WISHES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_wishes(wishes):
    try:
        with open(WISHES_FILE, "w", encoding="utf-8") as f:
            json.dump(wishes, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving wishes: {e}")

class DiwaliRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/wishes" or self.path.startswith("/api/wishes?"):
            wishes = load_wishes()
            data = json.dumps(wishes, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/wishes":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                new_wish = json.loads(post_data.decode("utf-8"))
                wishes = load_wishes()
                # Check if wish ID already exists
                if not any(w.get("id") == new_wish.get("id") for w in wishes):
                    wishes.insert(0, new_wish)
                    save_wishes(wishes)
                res = json.dumps({"status": "ok", "total": len(wishes)}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(res)))
                self.end_headers()
                self.wfile.write(res)
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(str(e).encode("utf-8"))
            return
        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    os.chdir(BASE_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DiwaliRequestHandler) as httpd:
        print(f"✨ Word Wizards Diwali Celebration Server running at: http://localhost:{PORT}")
        print(f"📁 Serving: {BASE_DIR}")
        print("🪔 Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

