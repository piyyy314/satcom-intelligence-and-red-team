# Contributing to GHOST-WATCH C2

First off, thank you for considering contributing to **GHOST-WATCH C2**! We welcome contributions from SATCOM engineers, cybersecurity researchers, SDR enthusiasts, and full-stack developers.

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: `v18.x` or `v20.x` (Recommended)
- **npm**: `v9.x` or later
- **Python**: `3.9+` (for the `ghostwatch_tools` package and tests)
- **Gemini API Key**: (Optional, enables Cognitive Shield and Script Compiler)

### Initial Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/baalbek313/ghost-watch-c2.git
   cd ghost-watch-c2
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Install Python package in editable mode:**
   ```bash
   pip install -e .[dev]
   ```

4. **Set up local environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` to `.env` if testing the AI features.

5. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation

Before submitting any Pull Request, ensure all checks pass:

### Frontend Typechecking & Linting:
```bash
npm run lint
```

### Full-Stack Build:
```bash
npm run build
```

### Python Toolkit Unit Tests:
```bash
# With pytest:
pytest tests/ -v

# Or using Python's built-in test runner:
python3 -m unittest discover -s tests
```

---

## 🌿 Git Branching & Commit Guidelines

1. **Branch naming:**
   - Features: `feat/feature-name`
   - Bug fixes: `fix/issue-description`
   - Documentation: `docs/update-description`
   - Refactoring: `refactor/subsystem-name`

2. **Commit messages:**
   Follow conventional commits:
   - `feat: add constellation diagram visualizer`
   - `fix: resolve NMEA parser timestamp boundary edge case`
   - `docs: update deployment guidelines for PlutoSDR`
   - `ci: upgrade GitHub Actions to v4`

---

## 🚀 Submitting a Pull Request

1. Push your branch to your fork.
2. Open a Pull Request targeting the `main` branch.
3. Fill out the PR template completely with details of what changed and how you tested it.
4. Ensure all CI workflow checks pass.

Thank you for helping secure satellite communications!
