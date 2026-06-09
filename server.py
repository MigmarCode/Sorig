import http.server
import socketserver
import os

PORT = 8000

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Remove trailing slash
        if self.path.endswith('/') and len(self.path) > 1:
            self.path = self.path[:-1]
            
        # Handle the /home redirect to index.html
        if self.path == '/home':
            self.path = '/index.html'
        
        # If the path has no extension and isn't just '/', try appending .html
        elif '.' not in self.path and self.path != '/':
            potential_file = self.path[1:] + '.html'
            if os.path.exists(potential_file):
                self.path += '.html'
                
        return super().do_GET()

print(f"Starting local server at http://localhost:{PORT} ...")
print("This server supports your clean URLs (e.g. /home, /about)!")
with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
    httpd.serve_forever()
