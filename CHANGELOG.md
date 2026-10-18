# Changelog

All notable changes to **GHOST-WATCH C2** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-18

### Added
- **Full-Stack C2 Web Console**: Modern tactical React interface running on Express with Vite middleware.
- **RF Spectrum Analyzer & Rolling Waterfall**: High-speed real-time 2D Canvas spectrogram waterfall displaying sliding 32-sweep frequency histories.
- **Daytime Field Operation Mode**: High-contrast, sunlight-readable UI theme toggle tailored for outdoor deployment alongside the obsidian tactical dark theme.
- **Direct Sequence Spread Spectrum (DSSS) Simulator**: Interactive Gold code generator and BPSK modulation playground with selectable chip rates (7, 11, 15 chips/bit).
- **Post-Quantum Cryptography (PQC) Ceremonies**: ML-KEM (Kyber-768/1024) and ML-DSA (Dilithium) simulated quantum-resistant handshakes for satellite uplinks.
- **Cognitive AI Threat Shield**: Server-side proxy integrating Gemini 3.8-Flash for live telemetry anomaly correlation and 3-step mitigation playbooks.
- **Cognitive Script Compiler**: Generative AI synthesis of custom, standalone Scapy and Python 3 defensive tools.
- **GPS Timing Drift & TDMA Audit**: Real-time NMEA sentence parsing and jitter detection to safeguard against GPS spoofing.
- **Antenna Control Unit (ACU) De-Pointing Simulation**: Automated azimuth/elevation deviation tests and ground station alignment recovery.
- **Performance Enhancing Proxy (PEP) Evasion**: TCP window acceleration state testing module.
- **Python Diagnostic Toolkit (`ghostwatch_tools`)**: 9 standalone, production-ready Python CLI audit scripts packaged with `pyproject.toml`.
- **Automated Test Suite**: Unit tests with dual compatibility for `pytest` and Python's standard `unittest` framework.
- **Continuous Integration**: GitHub Actions CI workflow covering multi-version Python testing (`3.9`, `3.10`, `3.11`, `3.12`) and Node.js compilation.
- **Community Health Files**: Issue templates, PR template, Dependabot configuration, Contributing guidelines, Code of Conduct, and Security policy.

---

[1.0.0]: https://github.com/baalbek313/ghost-watch-c2/releases/tag/v1.0.0
