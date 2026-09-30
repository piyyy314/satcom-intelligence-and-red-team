import pytest
import numpy as np

from ghostwatch_tools.gps_monitor import parse_pseudo_nmea, monitor_gps_drift
from ghostwatch_tools.dsss_modulator import DSSModulator, spread_and_report
from ghostwatch_tools.pluto_spectrum import run_pluto_capture
from ghostwatch_tools.pep_evasion import test_pep_evasion
from ghostwatch_tools.signal_anomaly import monitor_signal_baseline

def test_nmea_parsing():
    """Verify that the NMEA parser extracts the correct simulated timestamps."""
    sentence = "$GPRMC,183307.000,A,3723.2475,N,12158.3421,W,0.13,309.62,290926,,,A*61"
    parsed_time = parse_pseudo_nmea(sentence)
    assert parsed_time == 183307.000

    bad_sentence = "$GPGSV,2,1,08,01,40,083,46,02,17,308,44...*77"
    assert parse_pseudo_nmea(bad_sentence) is None

def test_dsss_modulation():
    """Verify that DSSS correctly maps characters to binary and modulates them."""
    msg = "SAT"
    factor = 11
    modulator = DSSModulator(chip_rate_factor=factor)
    
    signal, binary = modulator.modulate(msg)
    
    # Message 'SAT' is 3 characters. Each character is 8 bits.
    # Total bits = 3 * 8 = 24 bits.
    assert len(binary) == 24
    assert set(binary).issubset({'0', '1'})
    
    # 24 bits * 11 chips/bit = 264 chips.
    # Upsampled by chips_per_sample = 4, so total length = 264 * 4 = 1056 samples.
    assert len(signal) == 1056
    
    # Check that PN sequence has correct length
    assert len(modulator.pn_sequence) == factor

def test_pluto_spectrum_simulation():
    """Ensure spectrum captures can fall back to robust simulated arrays."""
    # Under simulation mode, run_pluto_capture returns True
    res = run_pluto_capture(pluto_ip="ip:127.0.0.1", simulate=True)
    assert res is True

def test_pep_evasion_simulation():
    """Verify the PEP evasion tester runs correctly in simulation mode."""
    res = test_pep_evasion(target_ip="127.0.0.1", target_port=80, simulate=True)
    assert res is True

def test_signal_anomaly_simulation():
    """Verify the signal anomaly monitor runs for its set duration."""
    res = monitor_signal_baseline(duration_seconds=2, snr_threshold=10.0)
    assert res is True
