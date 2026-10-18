#!/usr/bin/env python3
"""
DSSS Modulator & Covert LPI Transmitter.
Performs Direct Sequence Spread Spectrum modulation by multiplying baseband symbols 
with high-frequency pseudorandom spreading codes (Gold code approximation).
"""

import argparse
import numpy as np

class DSSModulator:
    def __init__(self, chip_rate_factor: int = 11, carrier_freq: int = 1000, sample_rate: int = 10000):
        self.chip_rate_factor = chip_rate_factor
        self.carrier_freq = carrier_freq
        self.sample_rate = sample_rate
        self.pn_sequence = self._generate_pn_sequence(chip_rate_factor)

    def _generate_pn_sequence(self, length: int):
        # Deterministic reproducible pseudorandom spreading chips
        np.random.seed(42)
        return (np.random.randint(0, 2, length) * 2 - 1).tolist()

    def modulate(self, data_str: str):
        """Spreads ASCII word into modulated chips multiplied by cosine carrier."""
        # Map string to binary bits list
        binary_str = ''.join(format(ord(c), '08b') for c in data_str)
        bits = [int(b) for b in binary_str]
        
        modulated_signal = []
        chips_per_sample = 4 # Small upsampling factor for simulation
        
        for bit in bits:
            data_symbol = 1 if bit == 1 else -1
            spread_sequence = [data_symbol * chip for chip in self.pn_sequence]
            upsampled_spread = np.repeat(spread_sequence, chips_per_sample)
            t = np.linspace(0, len(upsampled_spread) / self.sample_rate, len(upsampled_spread), endpoint=False)
            carrier = np.cos(2 * np.pi * self.carrier_freq * t)
            bpsk_modulated = upsampled_spread * carrier
            modulated_signal.extend(bpsk_modulated)
            
        return np.array(modulated_signal), binary_str

def spread_and_report(word: str, factor: int = 11):
    print(f"[*] Starting DSSS spread modulation for message: '{word}'")
    mod = DSSModulator(chip_rate_factor=factor)
    signal, binary = mod.modulate(word)
    
    print(f"[+] Message successfully spread!")
    print(f"    Raw bitstream binary ({len(binary)} bits): {binary[:32]}...")
    print(f"    Modulated output contains {len(signal)} signal samples.")
    print(f"    Normal spectral density dropped by approx {10 * np.log10(factor):.1f} dB.")
    return True

def main():
    parser = argparse.ArgumentParser(description="DSSS Covert LPI Modulator")
    parser.add_argument('--msg', type=str, default='SAT', help='Message word to modulate')
    parser.add_argument('--factor', type=int, default=11, choices=[7, 11, 15], help='Spreading chips factor')
    args = parser.parse_args()
    spread_and_report(args.msg, args.factor)

if __name__ == '__main__':
    main()
