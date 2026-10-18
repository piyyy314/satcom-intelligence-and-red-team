#!/usr/bin/env python3
"""
GPS Timing Drift Monitor (TDMA Spoofing Detection).
Monitors simulated NMEA data streams for sudden time jumps or coordinates,
warning users of possible TDMA satellite network timing misalignment.
"""

import time
import random
import argparse

def parse_pseudo_nmea(sentence: str):
    """Simulates parsing an NMEA $GPRMC sentence for time."""
    parts = sentence.split(',')
    if len(parts) > 1 and parts[0] == '$GPRMC':
        try:
            return float(parts[1])
        except ValueError:
            return None
    return None

def monitor_gps_drift(tolerance_ms: float = 50, duration_seconds: int = 10):
    """
    Monitors for GPS time drift. TDMA networks often fail if 
    timing drifts by more than a few milliseconds.
    """
    print(f"[*] Starting GPS Timing Monitor. Drift Tolerance: {tolerance_ms}ms")
    print("[*] Listening to NMEA stream (Simulated)...")
    
    start_time = time.time()
    try:
        while time.time() - start_time < duration_seconds:
            current_sys_time = time.time()
            # Simulate a GPS spoofing attack happening randomly in normal continuous tests
            is_under_attack = random.random() > 0.8
            
            if is_under_attack:
                drift_injected = random.uniform(0.1, 0.5) 
                simulated_gps_time = current_sys_time + drift_injected
            else:
                simulated_gps_time = current_sys_time + random.uniform(0.001, 0.005)
                
            time_diff_ms = abs(simulated_gps_time - current_sys_time) * 1000
            
            if time_diff_ms > tolerance_ms:
                print(f"[!!!] SGNL ALARM: GPS Drift Detected! Drift: {time_diff_ms:.2f}ms")
                print(f"[!!!] TDMA Sync is at risk. Possible GPS Spoofing.")
            else:
                print(f"[OK] Clock Sync Stable. Drift: {time_diff_ms:.2f}ms")
                
            time.sleep(2)
        return True
    except KeyboardInterrupt:
        print("\n[*] Monitoring terminated.")
        return True

def main():
    parser = argparse.ArgumentParser(description="GPS Timing Drift Monitor")
    parser.add_argument('--tolerance', type=float, default=50.0, help='Drift Tolerance in milliseconds')
    parser.add_argument('--duration', type=int, default=10, help='Audit monitoring duration in seconds')
    args = parser.parse_args()
    monitor_gps_drift(args.tolerance, args.duration)

if __name__ == '__main__':
    main()
