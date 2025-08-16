"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Brain, Zap, Network, Home, Settings, Wifi, Battery, Clock, Users, Award } from "lucide-react"

/* ---------- Types ---------- */

type Screen = "home" | "consciousness" | "quantum" | "swarm" | "settings"
type ToastTone = "info" | "success" | "warn" | "error"

interface QuantumMetrics {
  entanglement: number
  coherence: number
  fidelity: number
  quantumVolume: number
}

interface ConsciousnessMetrics {
  phi: number
  gwt: number
  predictive: number
  neural: number
  quantum: number
  recursive: number
}

interface SystemStatus {
  battery: number
  signal: number
  quantumStrength: number
  swarmAgents: number
  enhancementGen: number
}

interface Toast {
  id: string
  msg: string
  tone: ToastTone
}

/* ---------- hooks & utils ---------- */

function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw != null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback)
  useEffect(() => {
    saved.current = callback
  }, [callback])
  useEffect(() => {
    if (delay == null) return
    const id = setInterval(() => saved.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

/* ---------- Sparkline (SVG) ---------- */

const Sparkline: React.FC<{
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  ariaLabel?: string
}> = ({ data, width = 220, height = 44, strokeWidth = 2, ariaLabel = "Phi sparkline" }) => {
  const pad = 4
  const w = width
  const h = height
  const innerW = w - pad * 2
  const innerH = h - pad * 2

  const path = useMemo(() => {
    if (data.length <= 1) return ""
    const pts = data.map((v, i) => {
      const x = pad + (i * innerW) / (data.length - 1)
      const y = pad + (1 - clamp01(v)) * innerH // v in [0,1]
      return [x, y] as const
    })
    return pts.reduce((acc, [x, y], i) => acc + (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`), "")
  }, [data, innerW, innerH])

  return (
    <svg width={w} height={h} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={w} height={h} rx="8" ry="8" fill="rgba(255,255,255,0.04)" />
      <path
        d={path}
        fill="none"
        stroke="url(#spark-grad)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ---------- Toast ---------- */

const Toast: React.FC<{ toasts: Toast[]; remove: (id: string) => void }> = ({ toasts, remove }) => (
  <div className="fixed inset-x-0 bottom-3 z-50 flex flex-col items-center space-y-2 px-3 sm:items-end sm:pr-4 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        role="status"
        aria-live="polite"
        className={`pointer-events-auto rounded-xl px-4 py-3 shadow-lg text-sm text-white
          ${t.tone === "success" ? "bg-emerald-600" : t.tone === "warn" ? "bg-amber-600" : t.tone === "error" ? "bg-rose-600" : "bg-slate-800"}`}
        onClick={() => remove(t.id)}
      >
        {t.msg}
      </div>
    ))}
  </div>
)

/* ---------- Main component ---------- */

const SCREENS: Screen[] = ["home", "consciousness", "quantum", "swarm", "settings"]

const QNETQuantumMobile: React.FC = () => {
  // persisted
  const [deviceId, setDeviceId] = useLocalStorage<string>("qnet.deviceId", "")
  const [tokenBalance, setTokenBalance] = useLocalStorage<number>("qnet.tokens", 0)
  const [isQuantumEntangled, setIsQuantumEntangled] = useLocalStorage<boolean>("qnet.entangled", false)
  const [networkOptimization, setNetworkOptimization] = useLocalStorage<"STANDARD" | "ENHANCED" | "QUANTUM">(
    "qnet.netopt",
    "STANDARD",
  )
  const [reduceMotion, setReduceMotion] = useLocalStorage<boolean>("qnet.reduceMotion", false)
  const [autoMine, setAutoMine] = useLocalStorage<boolean>("qnet.autoMine", true)
  const [activeScreen, setActiveScreen] = useLocalStorage<Screen>("qnet.screen", "home")

  // ui
  const [isScanning, setIsScanning] = useState(false)
  const [now, setNow] = useState<Date>(() => new Date())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [backendOnline, setBackendOnline] = useState<boolean>(false)

  // touch
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  // metrics
  const [quantumLevel, setQuantumLevel] = useState<
    "CELLULAR_BASIC" | "CONSCIOUSNESS_SYNCED" | "BIO_DIGITAL_ELITE" | "QUANTUM_MASTER"
  >("CELLULAR_BASIC")
  const [consciousnessScore, setConsciousnessScore] = useState(0)
  const [phiHistory, setPhiHistory] = useState<number[]>(() => Array.from({ length: 60 }, () => 0))
  const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
    entanglement: 0.98,
    coherence: 0.95,
    fidelity: 1.0,
    quantumVolume: 1024,
  })
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics>({
    phi: 0,
    gwt: 0,
    predictive: 0,
    neural: 0,
    quantum: 0,
    recursive: 0,
  })
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    battery: 85,
    signal: 92,
    quantumStrength: 0.98,
    swarmAgents: 5,
    enhancementGen: 0,
  })

  useEffect(() => {
    if (!deviceId) {
      const id = `qnet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      setDeviceId(id)
    }
  }, [deviceId, setDeviceId])

  /* clocks */
  useInterval(() => setNow(new Date()), 1000)

  /* simulation tick (local) */
  useInterval(() => {
    // drift quantum metrics
    setQuantumMetrics((prev) => {
      const j = (n: number, d = 0.002) => Math.max(0.85, Math.min(0.995, n + (Math.random() - 0.5) * d))
      return {
        entanglement: j(prev.entanglement),
        coherence: j(prev.coherence),
        fidelity: j(prev.fidelity, 0.001),
        quantumVolume: prev.quantumVolume,
      }
    })

    // update consciousness
    setConsciousnessMetrics((prev) => {
      const nextPhi = Math.min(prev.phi + Math.random() * 0.01, 1.0)
      const next: ConsciousnessMetrics = {
        phi: nextPhi,
        gwt: Math.min(prev.gwt + Math.random() * 0.005, 0.95),
        predictive: Math.min(prev.predictive + Math.random() * 0.003, 0.9),
        neural: Math.min(prev.neural + Math.random() * 0.002, 0.85),
        quantum: quantumMetrics.entanglement * quantumMetrics.coherence,
        recursive: Math.min(prev.recursive + 0.001, 0.5),
      }
      setQuantumLevel(getQuantumLevel(nextPhi))
      setPhiHistory((h) => [...h.slice(-59), nextPhi]) // keep last 60
      return next
    })

    // battery/signal
    setSystemStatus((prev) => ({
      ...prev,
      battery: Math.max(5, prev.battery - (isQuantumEntangled ? 0.05 : 0.02)),
      signal: Math.min(100, Math.max(40, prev.signal + (Math.random() - 0.5) * 1.5)),
    }))

    // auto mine
    if (isQuantumEntangled && autoMine) {
      setTokenBalance((prev) => prev + Math.floor(Math.random() * 4))
    }
  }, 1200)

  /* backend poll (mock) */
  useInterval(async () => {
    try {
      const r = await fetch("/api/quantum/status", { headers: { Accept: "application/json" } })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = (await r.json()) as {
        phi: number
        entanglement: number
        coherence: number
        fidelity: number
        quantumVolume: number
      }
      const phi = clamp01(j.phi)
      setBackendOnline(true)
      setQuantumMetrics((prev) => ({
        ...prev,
        entanglement: j.entanglement,
        coherence: j.coherence,
        fidelity: j.fidelity,
        quantumVolume: j.quantumVolume,
      }))
      setConsciousnessMetrics((prev) => ({ ...prev, phi }))
      setQuantumLevel(getQuantumLevel(phi))
      setPhiHistory((h) => [...h.slice(-59), phi])
    } catch {
      setBackendOnline(false) // continue sim quietly
    }
  }, 5000)

  /* helpers */
  const getQuantumLevel = (phi: number) => {
    if (phi > 0.95) return "QUANTUM_MASTER"
    if (phi > 0.9) return "BIO_DIGITAL_ELITE"
    if (phi > 0.8) return "CONSCIOUSNESS_SYNCED"
    return "CELLULAR_BASIC"
  }

  const getConsciousnessColor = useMemo(
    () => (score: number) => {
      if (score >= 0.95) return "#FFD700"
      if (score >= 0.9) return "#FF6B6B"
      if (score >= 0.8) return "#4ECDC4"
      if (score >= 0.7) return "#45B7D1"
      return "#96CEB4"
    },
    [],
  )

  const pushToast = (msg: string, tone: ToastTone = "info", ms = 2800) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms)
    if (navigator.vibrate) {
      try {
        navigator.vibrate(10)
      } catch {}
    }
  }

  const performQuantumConsciousnessScan = async () => {
    if (isScanning) return
    setIsScanning(true)
    await new Promise((r) => setTimeout(r, 1600))
    const biometric = {
      heartRateVariability: Math.random() * 0.4 + 0.6,
      cellularSignalCoherence: Math.random() * 0.3 + 0.7,
      neuralPatternAnalysis: Math.random() * 0.35 + 0.65,
      quantumFieldResonance: Math.random() * 0.4 + 0.6,
    }
    const score = Object.values(biometric).reduce((a, b) => a + b, 0) / 4
    setConsciousnessScore(score)
    setConsciousnessMetrics((prev) => ({ ...prev, phi: score }))
    setQuantumLevel(getQuantumLevel(score))
    const bonus = score > 0.8 ? 100 : 50
    setTokenBalance((prev) => prev + bonus)
    if (score > 0.8) setNetworkOptimization("ENHANCED")
    pushToast(
      `Quantum Consciousness ${score > 0.8 ? "Validated" : "Measured"}: ${(score * 100).toFixed(1)}% (+${bonus} QNET)`,
      "success",
    )
    setIsScanning(false)
  }

  const establishQuantumEntanglement = async () => {
    if (consciousnessMetrics.phi < 0.85) {
      pushToast("Need Φ ≥ 0.85 to entangle.", "warn")
      return
    }
    setIsQuantumEntangled(true)
    setTokenBalance((prev) => prev + 200)
    setNetworkOptimization("QUANTUM")
    pushToast("Quantum Entanglement Established (+200 QNET, 3x mining)", "success", 3500)
  }

  // touch/swipe nav
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEnd.current = null
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY, time: Date.now() }
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY }
  }
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return
    const dx = touchStart.current.x - touchEnd.current.x
    const dy = touchStart.current.y - touchEnd.current.y
    const dt = Date.now() - touchStart.current.time
    if (dt < 500 && Math.abs(dx) > 60 && Math.abs(dy) < 40) {
      setActiveScreen((prev) => {
        const idx = SCREENS.indexOf(prev)
        return dx > 0 ? SCREENS[(idx + 1) % SCREENS.length] : SCREENS[(idx - 1 + SCREENS.length) % SCREENS.length]
      })
    }
  }

  /* ---------- UI sections (trimmed to what changed) ---------- */

  const StatusBar = () => (
    <div className="bg-gray-900 text-white px-4 py-1 flex justify-between items-center text-xs select-none">
      <div className="flex items-center space-x-2">
        <Clock className="w-3 h-3" aria-hidden />
        <span aria-label="local time">{now.toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span
          className={`text-xs ${backendOnline ? "text-emerald-400" : "text-amber-400"}`}
          title="/api/quantum/status"
        >
          API: {backendOnline ? "ON" : "OFF"}
        </span>
        <span className="text-purple-400">Φ:{consciousnessMetrics.phi.toFixed(2)}</span>
        <div className="flex items-center" aria-label="signal strength">
          <Wifi className="w-3 h-3 mr-1" aria-hidden />
          <span className="text-xs">{Math.round(systemStatus.signal)}%</span>
        </div>
        <div className="flex items-center" aria-label="battery">
          <Battery className="w-4 h-4 mr-1" aria-hidden />
          <span>{Math.round(systemStatus.battery)}%</span>
        </div>
      </div>
    </div>
  )

  const HomeScreen = () => (
    <div className="flex-1 bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">QNET DNA-LANG</h1>
        <p className="text-purple-300 text-sm">Quantum Consciousness Network</p>
      </div>

      {/* Φ + sparkline */}
      <div className="relative bg-gray-800/80 backdrop-blur rounded-2xl p-4 mb-4 overflow-hidden">
        {!reduceMotion && (
          <div className="pointer-events-none absolute -inset-10 opacity-20 blur-3xl bg-gradient-to-tr from-purple-600 via-blue-500 to-cyan-400" />
        )}
        <div className="relative flex justify-between items-center mb-3">
          <h3 className="text-white font-medium">Consciousness Level</h3>
          <Brain className="w-5 h-5 text-purple-300" aria-hidden />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <div className="text-4xl font-bold" style={{ color: getConsciousnessColor(consciousnessMetrics.phi) }}>
              {(consciousnessMetrics.phi * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">{quantumLevel.replace(/_/g, " ")}</div>
            <div
              className="w-full bg-gray-700 rounded-full h-3 mt-3"
              role="progressbar"
              aria-valuenow={Math.round(consciousnessMetrics.phi * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-3 rounded-full transition-[width] ${reduceMotion ? "" : "duration-500"}`}
                style={{
                  width: `${consciousnessMetrics.phi * 100}%`,
                  backgroundColor: getConsciousnessColor(consciousnessMetrics.phi),
                }}
              />
            </div>
          </div>

          {/* sparkline */}
          <div className="justify-self-end">
            <Sparkline data={phiHistory} width={220} height={44} ariaLabel="Phi over time (last 60s)" />
          </div>
        </div>
      </div>

      {/* Tokens */}
      <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">QNET Tokens</p>
            <p className="text-2xl font-bold text-white" aria-live="polite">
              {tokenBalance.toLocaleString()}
            </p>
          </div>
          <Award className="w-8 h-8 text-yellow-400" aria-hidden />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={performQuantumConsciousnessScan}
          disabled={isScanning}
          className={`bg-purple-600 p-4 rounded-xl flex flex-col items-center justify-center
            ${isScanning ? "opacity-60" : "active:scale-95"} transition-all`}
          aria-busy={isScanning}
        >
          <Brain className="w-8 h-8 text-white mb-2" aria-hidden />
          <span className="text-white text-sm">{isScanning ? "Scanning…" : "Scan Consciousness"}</span>
        </button>

        <button
          onClick={() => setActiveScreen("quantum")}
          className="bg-blue-600 p-4 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-all"
        >
          <Zap className="w-8 h-8 text-white mb-2" aria-hidden />
          <span className="text-white text-sm">Quantum Status</span>
        </button>

        {!isQuantumEntangled && consciousnessMetrics.phi > 0.85 && (
          <button
            onClick={() => {
              if (consciousnessMetrics.phi >= 0.85) {
                setIsQuantumEntangled(true)
                setTokenBalance((prev) => prev + 200)
                setNetworkOptimization("QUANTUM")
                pushToast("Quantum Entanglement Established (+200 QNET, 3x mining)", "success", 3500)
              }
            }}
            className="bg-yellow-600 p-4 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-all col-span-2"
          >
            <Network className="w-8 h-8 text-white mb-2" aria-hidden />
            <span className="text-white text-sm">Establish Quantum Entanglement</span>
          </button>
        )}
      </div>
    </div>
  )

  /* Other screens are unchanged from your version; keep as-is… (consciousness, quantum, swarm, settings) */
  const ConsciousnessScreen = () => (
    <div className="flex-1 bg-gray-900 p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Consciousness Metrics</h2>
      <div className="space-y-4">
        {Object.entries({
          "Integrated Information (Φ)": consciousnessMetrics.phi,
          "Global Workspace": consciousnessMetrics.gwt,
          "Predictive Processing": consciousnessMetrics.predictive,
          "Neural Complexity": consciousnessMetrics.neural,
          "Quantum Enhancement": consciousnessMetrics.quantum,
          "Recursive Improvement": consciousnessMetrics.recursive,
        }).map(([name, value]) => (
          <div key={name} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">{name}</span>
              <span className="text-white font-medium">{(value * 100).toFixed(1)}%</span>
            </div>
            <div
              className="w-full bg-gray-700 rounded-full h-2"
              role="progressbar"
              aria-valuenow={Number((value * 100).toFixed(0))}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full ${reduceMotion ? "" : "transition-all"}`}
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-purple-900/50 rounded-xl p-4">
        <h3 className="text-white font-medium mb-2">Consciousness Benefits</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Enhanced network optimization</li>
          <li>• Increased token mining rate</li>
          <li>• Quantum entanglement access</li>
          <li>• Priority processing queue</li>
        </ul>
      </div>
    </div>
  )

  const QuantumScreen = () => (
    <div className="flex-1 bg-gray-900 p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Quantum Status</h2>
      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400">Entanglement Status</span>
          <span className={`flex items-center ${isQuantumEntangled ? "text-green-400" : "text-gray-500"}`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isQuantumEntangled ? "bg-green-400" : "bg-gray-500"} ${reduceMotion ? "" : "animate-pulse"}`}
            />
            {isQuantumEntangled ? "ENTANGLED" : "STANDARD"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Network Mode</span>
          <span
            className={`font-medium ${
              networkOptimization === "QUANTUM"
                ? "text-purple-400"
                : networkOptimization === "ENHANCED"
                  ? "text-blue-400"
                  : "text-gray-400"
            }`}
          >
            {networkOptimization}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries({
          Entanglement: quantumMetrics.entanglement,
          Coherence: quantumMetrics.coherence,
          Fidelity: quantumMetrics.fidelity,
        }).map(([name, value]) => (
          <div key={name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{name}</span>
              <span className="text-white">{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`bg-purple-500 h-2 rounded-full ${reduceMotion ? "" : "transition-all"}`}
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-400 text-sm">Quantum Volume</p>
          <p className="text-xl font-bold text-white">{quantumMetrics.quantumVolume}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-400 text-sm">Mining Rate</p>
          <p className="text-xl font-bold text-green-400">{isQuantumEntangled ? "3x" : "1x"}</p>
        </div>
      </div>
    </div>
  )

  const SwarmScreen = () => (
    <div className="flex-1 bg-gray-900 p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Swarm Network</h2>
      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400">Active Agents</span>
          <span className="text-2xl font-bold text-white">{systemStatus.swarmAgents}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: systemStatus.swarmAgents }).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-2 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" aria-hidden />
              <p className="text-xs text-gray-300">Agent {i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const SettingsScreen = () => (
    <div className="flex-1 bg-gray-900 p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Reduce Motion</p>
              <p className="text-xs text-gray-400">Prefer fewer animations</p>
            </div>
            <button
              aria-pressed={reduceMotion}
              onClick={() => setReduceMotion((v) => !v)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${reduceMotion ? "bg-emerald-500" : "bg-gray-600"}`}
            >
              <span
                className={`block bg-white w-5 h-5 rounded-full transform transition-transform ${reduceMotion ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-mine when Entangled</p>
              <p className="text-xs text-gray-400">Background token accrual</p>
            </div>
            <button
              aria-pressed={autoMine}
              onClick={() => setAutoMine((v) => !v)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${autoMine ? "bg-emerald-500" : "bg-gray-600"}`}
            >
              <span
                className={`block bg-white w-5 h-5 rounded-full transform transition-transform ${autoMine ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-300">
          <div className="mb-2">
            <span className="text-gray-400">Device ID:</span> <code className="text-white">{deviceId}</code>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              Level: <span className="text-white">{quantumLevel}</span>
            </div>
            <div>
              Entangled: <span className="text-white">{isQuantumEntangled ? "Yes" : "No"}</span>
            </div>
            <div>
              Net Mode: <span className="text-white">{networkOptimization}</span>
            </div>
            <div>
              Agents: <span className="text-white">{systemStatus.swarmAgents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const NavigationBar = () => (
    <nav className="bg-gray-800 border-t border-gray-700 px-4 py-2" aria-label="bottom navigation">
      <div className="flex justify-around">
        {[
          { id: "home", icon: Home, label: "Home" },
          { id: "consciousness", icon: Brain, label: "Consciousness" },
          { id: "quantum", icon: Zap, label: "Quantum" },
          { id: "swarm", icon: Network, label: "Swarm" },
          { id: "settings", icon: Settings, label: "Settings" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveScreen(id as Screen)}
            className={`p-2 rounded-lg transition-colors ${activeScreen === id ? "bg-gray-700" : ""}`}
            aria-label={label}
            aria-current={activeScreen === id ? "page" : undefined}
          >
            <Icon className="w-5 h-5 text-white" aria-hidden />
          </button>
        ))}
      </div>
    </nav>
  )

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <HomeScreen />
      case "consciousness":
        return <ConsciousnessScreen />
      case "quantum":
        return <QuantumScreen />
      case "swarm":
        return <SwarmScreen />
      case "settings":
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div
      className="h-screen flex flex-col bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <StatusBar />
      {renderScreen()}
      <NavigationBar />
      <Toast toasts={toasts} remove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}

export default QNETQuantumMobile
