#!/usr/bin/env python3
"""
Automated unit tests for GHOST-WATCH diagnostic toolkit.
Compatible with both pytest and python -m unittest.
"""

import unittest

from ghostwatch_tools.gps_monitor import parse_pseudo_nmea, monitor_gps_drift
from ghostwatch_tools.pep_evasion import test_pep_evasion
from ghostwatch_tools.signal_anomaly import monitor_signal_baseline

try:
    import numpy as np
    from ghostwatch_tools.dsss_modulator import DSSModulator, spread_and_report
    from ghostwatch_tools.pluto_spectrum import run_pluto_capture
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


class TestGhostWatchTools(unittest.TestCase):
    def test_nmea_parsing(self):
        """Verify that the NMEA parser extracts the correct simulated timestamps."""
        sentence = "$GPRMC,183307.000,A,3723.2475,N,12158.3421,W,0.13,309.62,290926,,,A*61"
        parsed_time = parse_pseudo_nmea(sentence)
        self.assertEqual(parsed_time, 183307.000)

        bad_sentence = "$GPGSV,2,1,08,01,40,083,46,02,17,308,44...*77"
        self.assertIsNone(parse_pseudo_nmea(bad_sentence))

    @unittest.skipUnless(HAS_NUMPY, "numpy required for DSSS modulation tests")
    def test_dsss_modulation(self):
        """Verify that DSSS correctly maps characters to binary and modulates them."""
        msg = "SAT"
        factor = 11
        modulator = DSSModulator(chip_rate_factor=factor)

        signal, binary = modulator.modulate(msg)

        # Message 'SAT' is 3 characters. Each character is 8 bits. Total = 24 bits.
        self.assertEqual(len(binary), 24)
        self.assertTrue(set(binary).issubset({'0', '1'}))

        # 24 bits * 11 chips/bit = 264 chips.
        # Upsampled by chips_per_sample = 4, so total length = 264 * 4 = 1056 samples.
        self.assertEqual(len(signal), 1056)
        self.assertEqual(len(modulator.pn_sequence), factor)

    @unittest.skipUnless(HAS_NUMPY, "numpy required for Pluto spectrum simulation tests")
    def test_pluto_spectrum_simulation(self):
        """Ensure spectrum captures can fall back to robust simulated arrays."""
        res = run_pluto_capture(pluto_ip="ip:127.0.0.1", simulate=True)
        self.assertTrue(res)

    def test_pep_evasion_simulation(self):
        """Verify the PEP evasion tester runs correctly in simulation mode."""
        res = test_pep_evasion(target_ip="127.0.0.1", target_port=80, simulate=True)
        self.assertTrue(res)

    def test_signal_anomaly_simulation(self):
        """Verify the signal anomaly monitor runs for its set duration."""
        res = monitor_signal_baseline(duration_seconds=2, snr_threshold=10.0)
        self.assertTrue(res)


# Standalone function wrappers for direct pytest invocation
def test_nmea_parsing():
    sentence = "$GPRMC,183307.000,A,3723.2475,N,12158.3421,W,0.13,309.62,290926,,,A*61"
    assert parse_pseudo_nmea(sentence) == 183307.000
    assert parse_pseudo_nmea("$GPGSV,bad_sentence") is None


def test_pep_evasion_simulation():
    assert test_pep_evasion(target_ip="127.0.0.1", target_port=80, simulate=True) is True


def test_signal_anomaly_simulation():
    assert monitor_signal_baseline(duration_seconds=2, snr_threshold=10.0) is True


if HAS_NUMPY:
    def test_dsss_modulation():
        modulator = DSSModulator(chip_rate_factor=11)
        signal, binary = modulator.modulate("SAT")
        assert len(binary) == 24
        assert len(signal) == 1056

    def test_pluto_spectrum_simulation():
        assert run_pluto_capture(pluto_ip="ip:127.0.0.1", simulate=True) is True


if __name__ == '__main__':
    unittest.main()
