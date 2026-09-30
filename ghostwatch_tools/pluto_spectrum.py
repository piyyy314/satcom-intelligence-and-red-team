#!/usr/bin/env python3
"""
ADALM-Pluto Live RF Spectrum Analyzer.
Connects to a local or remote ADALM-Pluto SDR via pyadi-iio 
to capture live IQ spectrum samples and display a fast Fourier transform.
"""

import sys
import argparse
import numpy as np

def run_pluto_capture(pluto_ip: str = "ip:192.168.2.1", simulate: bool = False):
    """
    Connects to PlutoSDR, grabs samples, and performs FFT.
    If no SDR is connected, falls back to simulated spectrum.
    """
    sample_rate_hz = 1e6
    center_freq_hz = 2.4e9
    buffer_size = 4096

    if simulate:
        print(f"[*] Simulating ADALM-Pluto SDR capture at {pluto_ip}")
        freq_bins = np.fft.fftshift(np.fft.fftfreq(buffer_size, d=1/sample_rate_hz)) / 1e6
        noise = -95 + np.random.normal(0, 3, buffer_size)
        peak_index = buffer_size // 2
        noise[peak_index-10:peak_index+10] += 30 * np.exp(-np.linspace(-2, 2, 20)**2)
        print(f"[+] Successfully simulated signal peak at center frequency: {center_freq_hz/1e9:.2f} GHz")
        print(f"    Peak amplitude: {np.max(noise):.2f} dBFS")
        return True

    try:
        import adi
    except ImportError:
        print("[!] pyadi-iio library not found. Falling back to simulated SDR spectrum.")
        print("[!] To install Pluto dependencies: pip install pyadi-iio")
        return run_pluto_capture(pluto_ip, simulate=True)

    try:
        sdr = adi.Pluto(pluto_ip)
        print(f"[*] Connected to ADALM-Pluto SDR at {pluto_ip}")
        
        sdr.sample_rate = int(sample_rate_hz)
        sdr.rx_lo = int(center_freq_hz)
        sdr.rx_gain_control_mode = "manual"
        sdr.rx_hardwaregain_chan0 = 20
        sdr.rx_buffer_size = buffer_size
        sdr.rx_enabled_channels = [0]
        
        print("[*] Pulling IQ buffer...")
        rx_samples = sdr.rx()
        rx_samples_float = rx_samples.astype(np.float32) / (2**11)
        spectrum = np.fft.fftshift(np.fft.fft(rx_samples_float))
        spectrum_mag_db = 20 * np.log10(np.abs(spectrum) + 1e-9)
        
        print(f"[+] PlutoSDR FFT Processed. Mean Amplitude: {np.mean(spectrum_mag_db):.2f} dBFS")
        sdr.rx_enabled_channels = []
        sdr.close()
        return True
    except Exception as e:
        print(f"[-] Could not establish connection to physical SDR: {e}")
        print("[*] Launching simulated fall-back...")
        return run_pluto_capture(pluto_ip, simulate=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="ADALM-Pluto SDR Spectrum Capture")
    parser.add_argument('--ip', type=str, default='ip:192.168.2.1', help='PlutoSDR URI or IP address')
    parser.add_argument('--sim', action='store_true', help='Force simulated SDR behavior')
    args = parser.parse_args()
    
    run_pluto_capture(args.ip, args.sim)
