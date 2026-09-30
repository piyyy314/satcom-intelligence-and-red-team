import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Endpoint for Anomaly Analysis
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { telemetry, logs } = req.body;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets." });
      }

      const prompt = `You are the GHOST-WATCH COGNITIVE SHIELD, an advanced AI system integrated with a satellite communications (SATCOM) monitoring terminal.
Below are the current real-time telemetry metrics and diagnostic logs from our VSAT and RF monitoring subsystems.

TELEMETRY METRICS:
- Signal-to-Noise Ratio (SNR): ${telemetry.snr} dB
- Bit Error Rate (BER): ${telemetry.ber}
- Jamming Probability: ${telemetry.jammingProbability}
- GPS Drift/Jitter: ${telemetry.gpsDrift} ms
- Antenna Alignment (ACU): Azimuth=${telemetry.acuAzimuth}°, Elevation=${telemetry.acuElevation}°, Aligned=${telemetry.isAcuAligned ? 'YES' : 'NO'}
- Performance Enhancing Proxy (PEP) Status: ${telemetry.pepStatus} (${telemetry.pepStateConnections} active connections)
- Pluto SDR Frequency: ${telemetry.plutoCenterFreq} GHz with Gain: ${telemetry.plutoGain} dB

RECENT DIAGNOSTIC LOGS:
${logs.slice(0, 15).join('\n')}

INSTRUCTIONS:
1. Diagnose the current system state. If there is an anomaly (e.g., GPS spoofing, ACU misalignment, PEP exhaustion, jamming), identify it clearly and explain the technical root cause from first principles.
2. Provide a 3-step mitigation playbook for red-team audit/defensive response. Keep it technical, concrete, and suited for high-tier SATCOM operators.
3. Keep the response compact and return a clean JSON structure conforming to the following keys:
- "status": A brief technical status string (e.g., "NOMINAL", "SATELLITE_DEPOINT_DETECTED", "GPS_TIMING_ATTACK", "STATE_TABLE_FLOOD")
- "threatLevel": "LOW", "MEDIUM", or "HIGH"
- "diagnosis": A detailed, authoritative, technical description of what is happening under the hood (2-3 sentences max).
- "playbook": An array of exactly 3 tactical, actionable mitigation steps.
- "signature": A post-quantum cryptographically formatted confirmation string (e.g., "[PQC_SHIELD_V6.0_SIGNED_BY_KYBER]").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Gemini Analyze Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze telemetry." });
    }
  });

  // API Endpoint for AI Script Generator / Code assistant
  app.post('/api/gemini/generate-script', async (req, res) => {
    try {
      const { scenario, targetSystem } = req.body;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets." });
      }

      const prompt = `You are a Senior SATCOM Systems Defense Engineer. Generate a complete, production-grade Python script to address the following scenario:

Scenario: "${scenario}"
Target System/Protocol: "${targetSystem}"

The script should:
1. Be fully documented and executable with Python 3.
2. If applicable, use standard libraries or common network tools like 'socket', 'urllib', or 'scapy' (include scapy import warnings).
3. Be highly realistic, containing actual code logic (no simple print placeholders for the core mechanism).
4. Return a JSON structure conforming to:
- "scriptTitle": A short title for the tool.
- "scriptDescription": A summary of what this custom tool does.
- "language": "python",
- "code": "The complete Python script as a single string",
- "operatorNotes": "Crucial deployment or audit notes for the SATCOM operator."`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Gemini Script Gen Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate custom script." });
    }
  });

  // Serve UI
  if (isProd) {
    // In production, serve built assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
