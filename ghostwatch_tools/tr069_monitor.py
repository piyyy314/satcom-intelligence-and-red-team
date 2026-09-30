#!/usr/bin/env python3
"""
TR-069 ACS Configuration Monitor.
Sniffs and decodes incoming TR-069 CWMP management traffic 
to spot unauthorized ACS URL changes or rogue parameters.
"""

import socket
import argparse

def monitor_tr069_requests(port: int = 7547, max_connections: int = 2):
    """
    Sets up a simple socket handler on the standard TR-069 port to monitor 
    incoming XML SOAP CWMP requests from satellite terminal modems.
    """
    print(f"[*] Initializing TR-069 SOAP Listener on port {port}...")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    connections_handled = 0
    try:
        server.bind(('0.0.0.0', port))
        server.listen(5)
        while connections_handled < max_connections:
            conn, addr = server.accept()
            print(f"[+] Incoming CWMP Connection from satellite node {addr[0]}")
            request = conn.recv(4096).decode('utf-8', errors='ignore')
            
            if "SetParameterValues" in request:
                print("    [ALERT] ACS SetParameterValues instruction detected.")
                if "ManagementServer.URL" in request:
                    print("    [CRITICAL] System attempting to rewrite ACS URL!")
                    
            # Return basic 204 No Content response to maintain protocol state
            conn.sendall(b"HTTP/1.1 204 No Content\r\nServer: CWMP-Monitor\r\n\r\n")
            conn.close()
            connections_handled += 1
        return True
    except KeyboardInterrupt:
        print("\n[-] Shutting down monitor.")
        return True
    finally:
        server.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="TR-069 CWMP Configuration Monitor")
    parser.add_argument('--port', type=int, default=7547, help='Port to bind and listen on')
    parser.add_argument('--count', type=int, default=2, help='Max connection sweeps to handle')
    args = parser.parse_args()
    
    monitor_tr069_requests(args.port, args.count)
