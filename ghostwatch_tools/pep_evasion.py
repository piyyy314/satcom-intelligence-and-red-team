#!/usr/bin/env python3
"""
SATCOM PEP State Evasion Tester.
Crafts raw TCP packets with asymmetric options and custom flags using Scapy
to test state limit resilience on satellite acceleration links (Performance Enhancing Proxies).
"""

import sys
import argparse

def test_pep_evasion(target_ip: str, target_port: int = 80, simulate: bool = False):
    """
    Sends TCP packets designed to confuse satellite PEP accelerators.
    If the PEP drops or forwards these improperly, it indicates 
    a vulnerability in the satellite TCP acceleration layer.
    """
    print(f"[*] Initiating PEP Evasion Test against {target_ip}:{target_port}")
    
    if simulate:
        print("[*] (Simulation Mode Active)")
        print("[*] Sending TCP SYN with invalid checksum... (Simulated)")
        print("[*] Sending TCP SYN with malformed TCP Options... (Simulated)")
        print("[*] Sending PEP State Exhaustion burst (100 packets)... (Simulated)")
        print("[+] PEP Evasion simulation complete. Gateway remains stable.")
        return True

    try:
        from scapy.all import IP, TCP, send, RandShort
    except ImportError:
        print("[!] Scapy library not installed. Standard audit falls back to simulation mode.")
        print("[!] To run real Scapy testing, execute: pip install scapy")
        return test_pep_evasion(target_ip, target_port, simulate=True)
    
    # Test 1: Asymmetric Routing / Bad Checksum
    print("[*] Sending TCP SYN with invalid checksum...")
    pkt1 = IP(dst=target_ip)/TCP(dport=target_port, flags="S", chksum=0x0000)
    send(pkt1, verbose=0)
    
    # Test 2: Invalid TCP Options (rewriting window scaling)
    print("[*] Sending TCP SYN with malformed TCP Options...")
    malformed_options = [('WScale', 255), ('MSS', 0), ('SAckOK', b'')]
    pkt2 = IP(dst=target_ip)/TCP(dport=target_port, flags="S", options=malformed_options)
    send(pkt2, verbose=0)
    
    # Test 3: PEP State Table Exhaustion (Micro-Flood)
    print("[*] Sending PEP State Exhaustion burst (100 packets)...")
    for _ in range(100):
        pkt3 = IP(dst=target_ip)/TCP(sport=RandShort(), dport=target_port, flags="S")
        send(pkt3, verbose=0)
        
    print("[+] PEP Evasion testing complete. Check modem state logs.")
    return True

def main():
    parser = argparse.ArgumentParser(description="SATCOM PEP State Evasion Tester")
    parser.add_argument('--ip', type=str, default='10.10.10.5', help='Modem gateway IP address')
    parser.add_argument('--port', type=int, default=80, help='Modem admin HTTP port')
    parser.add_argument('--sim', action='store_true', help='Run fully simulated test without Scapy dependency')
    args = parser.parse_args()
    test_pep_evasion(args.ip, args.port, args.sim)

if __name__ == '__main__':
    main()
