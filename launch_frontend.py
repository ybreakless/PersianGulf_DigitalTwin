import http.server
import socketserver
import os
import webbrowser

# CONFIGURATION
PORT = 5500
DIRECTORY = "frontend_interface"

def launch():
    # 1. Check if the directory actually exists
    if not os.path.exists(DIRECTORY):
        print(f"❌ ERROR: Could not find folder '{DIRECTORY}'")
        print(f"   Current working directory is: {os.getcwd()}")
        return

    # 2. Move into the frontend directory
    os.chdir(DIRECTORY)
    
    # 3. Setup the Server
    Handler = http.server.SimpleHTTPRequestHandler
    
    # 4. Allow re-using the port if it was just closed (prevents 'Address already in use' errors)
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n✅ FRONTEND SERVER ONLINE")
        print(f"   ---------------------------------------")
        print(f"   📂 Serving Folder: {DIRECTORY}")
        print(f"   🔗 Local Address:  http://localhost:{PORT}")
        print(f"   ---------------------------------------")
        print("   (Press Ctrl+C to stop)")
        
        # 5. Automatically open the browser for you
        webbrowser.open(f"http://localhost:{PORT}")
        
        # 6. Run forever
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user.")

if __name__ == "__main__":
    launch()