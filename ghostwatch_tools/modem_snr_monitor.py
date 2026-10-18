#!/usr/bin/env python3
"""
Modem SNR Monitor & Link State Recon.
Queries remote VSAT satellite modems via Telnet management socket commands 
to monitor real-time signal-to-noise ratio.
"""

import socket
import re
import argparse

def query_modem_snr(modem_ip: str, modem_port: int, query_command: str = "show snr\n", timeout: int = 5):
    """
    Connects to the VSAT satellite modem telnet/TCP interface, 
    sends the SNR status query command, and parses the returned carrier strength.
    """
    print(f"[*] Querying VSAT Modem telemetry at {modem_ip}:{modem_port}...")
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            sock.connect((modem_ip, modem_port))
            sock.sendall(query_command.encode('utf-8'))

            response_data = b''
            buffer_size = 1024
            while True:
                chunk = sock.recv(buffer_size)
                if not chunk:
                    break
                response_data += chunk
                if b'\n' in chunk or len(response_data) > buffer_size * 2:
                    break
            
            decoded_response = response_data.decode('utf-8', errors='ignore').strip()
            print(f"    [Modem RAW Feed]: {decoded_response}")
            
            # Match standard SNR parameters (e.g., C/N or SNR: 12.8dB)
            snr_match = re.search(r'(SNR|C_N_RATIO)[:=\s]*([-+]?\d*\.?\d+)', decoded_response, re.IGNORECASE)
            if snr_match:
                snr_val = float(snr_match.group(2))
                print(f"[+] Decoded Signal quality: {snr_val} dB")
                return snr_val
            else:
                print("[-] Command returned response but no standard SNR/CNR headers found.")
                return None
    except Exception as e:
        print(f"[-] Telnet query to modem failed: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Modem SNR Monitor")
    parser.add_argument('--ip', type=str, default='192.168.100.1', help='Modem IP address')
    parser.add_argument('--port', type=int, default=23, help='Modem Telnet port')
    parser.add_argument('--cmd', type=str, default='show snr\n', help='Command to send')
    args = parser.parse_args()
    query_modem_snr(args.ip, args.port, args.cmd)

if __name__ == '__main__':
    main()
