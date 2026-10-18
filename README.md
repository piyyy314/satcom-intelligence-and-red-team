# GHOST-WATCH C2: SATCOM Intelligence & Security Audit Terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![GHOST-WATCH CI](https://github.com/baalbek313/ghost-watch-c2/actions/workflows/ci.yml/badge.svg)](https://github.com/baalbek313/ghost-watch-c2/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/Python-3.9%20%7C%203.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-cyan.svg)](CONTRIBUTING.md)

**GHOST-WATCH C2** is an advanced, full-stack satellite communications (SATCOM) monitoring, diagnostics, and security-hardening console. Designed for satellite network engineers, SDR enthusiasts, and security auditors, this system bridges the gap between physical-layer RF telemetry and digital-layer cybersecurity.

The system features real-time simulated Software Defined Radio (SDR) spectrum analyzers with rolling spectrogram waterfall displays, Direct Sequence Spread Spectrum (DSSS) Low Probability of Intercept (LPI) modulators, Post-Quantum Cryptographic (PQC) validation ceremonies, sunlight-readable Daytime Field Operation mode, and an active **Cognitive AI Copilot** running server-side Gemini models to analyze telemetry anomalies and compile on-the-fly defensive playbooks.

---

## 🛰️ Core Features

*   **RF Spectrum Analyzer & Rolling Waterfall**: Captures live simulated IQ frequency samples (approximating ADALM-Pluto SDR feeds), displaying real-time power spectral density and rolling spectrogram waterfall histories rendered via high-performance HTML5 Canvas.
*   **Daytime Field Operation Mode**: Instant high-contrast, sunlight-readable UI theme toggle designed for tactical field audits under bright outdoor lighting, complemented by the default obsidian dark theme.
*   **DSSS LPI Modulator Playground**: Interactive digital signal processing (DSP) environment demonstrating how to spread arbitrary ASCII messages under the noise floor using selectable Gold code spreading sequences (7, 11, or 15 chips/bit).
*   **Post-Quantum Key Ceremonies (Kyber & Dilithium)**: Interactive simulation of modern PQC standard implementations (ML-KEM / ML-DSA) for satellite command-and-control links, safeguarding telemetry streams from quantum-adversary decryption.
*   **GPS Clock Drift & Timing Sync Audit**: Monitors NMEA data streams for microsecond timing drift, auditing TDMA slot alignment and protecting against timing spoofing/jamming attacks.
*   **Cognitive AI Threat Shield (Gemini-Powered)**: Full-stack integration with Gemini 3.8-Flash to automatically correlate physical-layer telemetry anomalies (e.g., sudden SNR drops or ACU offset shifts) with digital indicators, compiling detailed diagnoses and 3-step tactical playbooks.
*   **Cognitive Script Compiler**: An active on-demand code synthesis interface that translates custom operator testing scenarios into executable Python 3 and Scapy defensive scripts.
*   **Hardened Script Library**: A vetted, pre-packaged collection of 9 standalone Python 3 diagnostic utilities ready for terminal audits, SCADA testing, and NMEA timing sync monitoring.

---

## 📂 Repository Structure

The repository is organized into a full-stack React + Express web application and a packaged, distributable Python diagnostic toolkit:

```text
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # GitHub Actions CI for Node.js build & Python test matrix
│   │   └── release.yml         # Automated release packaging on version tags
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml      # Interactive GitHub issue form for bug reports
│   │   ├── feature_request.yml # Interactive GitHub issue form for feature requests
│   │   └── config.yml          # Issue template settings & security contact link
│   ├── dependabot.yml          # Automated dependency updates for npm and pip
│   └── PULL_REQUEST_TEMPLATE.md# Standard PR checklist & testing instructions
├── .editorconfig               # Cross-IDE indentation & formatting consistency
├── .gitattributes              # Line-ending normalization & linguist definitions
├── .gitignore                  # Comprehensive ignore rules (Node, Vite, Python, OS)
├── .env.example                # Template for environment variables (API keys)
├── package.json                # Node.js Full-stack dependencies & scripts
├── server.ts                   # Express server with Vite middleware & Gemini proxy
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite configuration with Tailwind CSS v4 support
├── index.html                  # HTML entry point with synced SEO & OpenGraph meta
├── CHANGELOG.md                # Keep a Changelog compliant release history
├── CONTRIBUTING.md             # Developer setup, testing, and contribution guidelines
├── CODE_OF_CONDUCT.md          # Contributor Covenant Code of Conduct v2.1
├── SECURITY.md                 # Security policy & responsible vulnerability disclosure
├── LICENSE                     # MIT License
├── src/                        # React Frontend
│   ├── App.tsx                 # Core C2 Terminal Dashboard, Spectrogram & simulation state
│   ├── main.tsx                # App entrypoint
│   └── index.css               # Global styled-sheet & terminal scanline effects
├── ghostwatch_tools/           # Standalone Python 3 SATCOM Diagnostic Toolkit
│   ├── __init__.py             # Python package constructor
│   ├── acu_depoint.py          # Telnet Serial-over-Ethernet SCADA ACU adjuster
│   ├── gps_monitor.py          # NMEA serial time-sync drift listener
│   ├── pep_evasion.py          # Scapy satellite TCP acceleration tester
│   ├── pluto_spectrum.py       # Live ADALM-Pluto SDR pyadi-iio plotter
│   ├── dsss_modulator.py       # DSSS BPSK mathematical modulator with Gold sequences
│   ├── modem_snr_monitor.py    # Telnet SNR query logger
│   ├── cve_scanner.py          # Firmware auth-bypass command-sanitization auditor
│   ├── tr069_monitor.py        # CWMP XML SOAP listener
│   └── signal_anomaly.py       # Continuous baseline SNR/BER background monitor
├── tests/                      # Automated test suite (compatible with pytest & unittest)
│   ├── __init__.py
│   └── test_tools.py           # Unit tests for the Python diagnostic toolkit
└── pyproject.toml              # PyPI package distribution configuration & CLI entry points
```

---

## ⚡ Quick Start: Web Console

The GHOST-WATCH C2 Web Console runs as an Express full-stack server proxying the React frontend and handling Gemini API actions.

### Prerequisites

*   **Node.js**: $\ge 18.x$ (Recommended: `20.x`)
*   **Gemini API Key**: (Optional) Configured in `.env` to unlock the Cognitive AI Threat Shield and Script Compiler.

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

### Typechecking & Building for Production

To run static analysis and compile the full-stack server into an optimized ESM bundle:
```bash
npm run lint    # TypeScript typecheck
npm run build   # Production Vite frontend build + esbuild server bundle
npm start       # Start production server on port 3000
```

---

## 🐍 Python Diagnostic Toolkit (`ghostwatch_tools`)

The standalone Python utilities in `ghostwatch_tools/` are fully structured for distribution and deployment.

### Installation from Source

You can install the toolkit locally in editable developer mode:
```bash
pip install -e .[dev]
```

Once installed, convenient CLI shortcut commands become available:
```bash
ghostwatch-gps --tolerance 25
ghostwatch-dsss --msg "SATCOM" --factor 15
ghostwatch-spectrum --sim
ghostwatch-pep --sim
ghostwatch-acu --ip 192.168.10.50
ghostwatch-cve --ip 192.168.100.1
ghostwatch-snr --ip 192.168.100.1
ghostwatch-tr069 --port 7547
ghostwatch-anomaly --duration 10
```

### Running Automated Tests

Run the test suite using `pytest`:
```bash
pytest tests/ -v
```

Or run directly without external test dependencies using Python's standard library:
```bash
python3 -m unittest discover -s tests
```

---

## 🔒 Security Notice & Disclaimer

**GHOST-WATCH C2** is designed strictly for **educational simulations, laboratory audits, and authorized academic demonstrations**. 
*   All attack simulations (ACU offset injection, PEP state exhaustion, GPS time-drifting) are managed in a safe, sandboxed client-side state machine.
*   The Python diagnostics are dual-use tools intended to help ground station operators harden their local facilities against physical-layer vulnerabilities and configure robust, compliant systems.
*   Do not deploy these tools against remote systems or satellite networks without explicit, documented authorization.
*   See [SECURITY.md](SECURITY.md) for our vulnerability disclosure policy.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 🤝 Contributing

We welcome contributions from SATCOM engineers, cybersecurity researchers, and developers!
Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

*(C) 2026 GHOST-WATCH LABS. AUTHORIZED LAB-USE CONTEXT.*
