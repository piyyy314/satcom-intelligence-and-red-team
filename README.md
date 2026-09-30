# GHOST-WATCH C2: SATCOM Intelligence & Security Audit Terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/baalbek313/ghost-watch-c2/actions/workflows/node.js.yml/badge.svg)](https://github.com)
[![Python CI](https://github.com/baalbek313/ghost-watch-c2/actions/workflows/python.yml/badge.svg)](https://github.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-cyan.svg)](https://github.com)

**GHOST-WATCH C2** is an advanced, full-stack satellite communications (SATCOM) monitoring, diagnostics, and security-hardening console. Designed for satellite network engineers, SDR enthusiasts, and security auditors, this system bridges the gap between physical-layer telemetry and digital-layer cybersecurity.

The system features real-time simulated Software Defined Radio (SDR) spectrum analyzers, Direct Sequence Spread Spectrum (DSSS) Low Probability of Intercept (LPI) modulators, Post-Quantum Cryptographic (PQC) validation ceremonies, and an active **Cognitive AI Copilot** running server-side LLMs to analyze telemetry anomalies and compile on-the-fly defensive playbooks.

---

## 🛰️ Core Features

*   **RF Spectrum Analyzer & Waterfall Display**: Captures live simulated IQ frequency samples (approximating ADALM-Pluto SDR feeds), displaying real-time power spectral density and rolling spectrogram waterfall histories.
*   **DSSS LPI Modulator Playground**: Interactive digital signal processing (DSP) environment demonstrating how to spread arbitrary ASCII messages under the noise floor using selectable Gold code spreading sequences (7, 11, or 15 chips/bit).
*   **Post-Quantum Key Ceremonies (Kyber & Dilithium)**: Interactive simulation of modern PQC standard implementations for satellite command-and-control links, safeguarding telemetry streams from future quantum-computer decryption.
*   **GPS Clock Drift & Timing Sync Audit**: Monitors NMEA data streams for microsecond timing drift, auditing TDMA slot alignment and protecting against timing spoofing/jamming attacks.
*   **Cognitive AI Threat Shield (Gemini-Powered)**: Full-stack integration with Gemini 3.8-Flash to automatically correlate physical-layer telemetry anomalies (e.g., sudden SNR drops or ACU offset shifts) with digital indicators, compiling detailed diagnoses and 3-step tactical playbooks.
*   **Cognitive Script Compiler**: An active on-demand code synthesis interface that translates custom operator testing scenarios into executable Python 3 and Scapy defensive scripts.
*   **Hardened Script Library**: A vetted, pre-packaged collection of 9 standalone Python 3 diagnostic utilities ready for terminal audits, SCADA testing, and NMEA timing sync monitoring.

---

## 📂 Repository Structure

The repository is organized into a full-stack React + Express web application and a packaged, distributable Python diagnostic toolkit:

```text
├── .env.example                # Template for environment variables (API keys)
├── package.json                # Node.js Full-stack dependencies & scripts
├── server.ts                   # Express server with Vite middleware & Gemini proxy
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite configuration with Tailwind CSS v4 support
├── index.html                  # HTML entry point for the C2 web console
├── src/                        # React Frontend
│   ├── App.tsx                 # Core C2 Terminal Dashboard & simulation state
│   ├── main.tsx                # App entrypoint
│   └── index.css               # Global styled-sheet & terminal HMR configurations
├── ghostwatch_tools/           # Standalone Python 3 SATCOM Diagnostic Toolkit
│   ├── __init__.py             # Python package constructor
│   ├── acu_depoint.py          # Telnet Serial-over-Ethernet SCADA ACU adjuster
│   ├── gps_monitor.py          # NMEA serial time-sync drift listener
│   ├── pep_evasion.py          # Scapy satellite TCP acceleration tester
│   ├── pluto_spectrum.py       # Live ADALM-Pluto SDR pyadi-iio plotter
│   ├── dsss_modulator.py       # DSSS BPSK mathematical modulator with Gold sequences
│   ├── modem_snr_monitor.py    # Telnet SNR query logger
│   ├── cve_scanner.py          # Firmware auth-bypass command-sanitization auditor
│   ├── tr069_monitor.py        # CWMP XML SOAP SOAP listener
│   └── signal_anomaly.py       # Continuous baseline SNR/BER background monitor
├── tests/                      # Python automated test suites
│   ├── __init__.py
│   └── test_tools.py           # Pytest unit tests for the Python toolkit
├── pyproject.toml              # PyPI package distribution configuration
├── LICENSE                     # MIT License
└── README.md                   # System documentation
```

---

## ⚡ Quick Start: Web Console

The GHOST-WATCH C2 Web Console runs as an Express full-stack server proxying the React frontend and handling Gemini API actions.

### Prerequisites

*   **Node.js**: $\ge 18.x$
*   **Gemini API Key**: Configured in your environment to unlock the AI Threat Shield and Script Compiler.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/baalbek313/ghost-watch-c2.git
   cd ghost-watch-c2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   ```

4. Launch the local development environment:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To build the static React assets and compile the full-stack server into highly optimized ESM:
```bash
npm run build
npm start
```

---

## 🐍 Python Diagnostic Toolkit (`ghostwatch_tools`)

The standalone Python utilities in `ghostwatch_tools/` are fully structured for distribution and deployment.

### Installation from Source

You can install the utilities locally in edit/developer mode:
```bash
pip install -e .
```

To run Pytest verification sweeps:
```bash
pip install pytest scapy numpy scipy matplotlib
pytest tests/
```

### Usage Examples

1. **Launch GPS Drift Monitoring**:
   ```bash
   python -m ghostwatch_tools.gps_monitor
   ```

2. **Plot Live ADALM-Pluto SDR Spectrum (Requires physical PlutoSDR connected)**:
   ```bash
   python -m ghostwatch_tools.pluto_spectrum
   ```

3. **Perform an ACU De-pointing Alignment Check (SCADA Simulated)**:
   ```bash
   python -m ghostwatch_tools.acu_depoint --ip 192.168.10.50
   ```

---

## 🔒 Security Notice & Disclaimer

**GHOST-WATCH C2** is designed strictly for **educational simulations, laboratory audits, and academic demonstrations**. 
*   All attack simulations (ACU offset injection, PEP state exhaustion, GPS time-drifting) are managed in a safe, sandboxed client-side state machine.
*   The Python diagnostics are dual-use tools intended to help ground station operators harden their local facilities against physical-layer vulnerabilities and configure robust, compliant systems.
*   Do not deploy these tools against remote systems or satellite networks without explicit, documented authorization.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

We welcome contributions from SATCOM engineers, cybersecurity researchers, and developers!
1. Fork the project.
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

*(C) 2026 GHOST-WATCH OFFENSIVE & DEPLOYMENT LABS. RESTRICTED LAB-USE CONTEXT.*
