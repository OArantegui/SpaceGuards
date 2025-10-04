#!/usr/bin/env python3
"""
Servidor HTTP simple para desarrollo local
Ejecutar: python server.py
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Permitir CORS para desarrollo
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor iniciado en http://localhost:{PORT}")
        print(f"📂 Sirviendo archivos desde: {os.getcwd()}")
        print(f"🌐 Abre http://localhost:{PORT} en tu navegador")
        print(f"⏹️  Presiona Ctrl+C para detener el servidor\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✅ Servidor detenido correctamente")
