"use client";

import { useEffect, useState, useCallback } from "react";
import { generateSudoku } from "./sudokuGenerator";

declare global {
  interface Window { Module: any; }
}

const CELL_SIZE = 64;

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [initialBoard, setInitialBoard] = useState<number[]>([]);
  const [board, setBoard] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    const first = generateSudoku(30);
    setInitialBoard(first);
    setBoard(first);
    setMounted(true);

    if (document.querySelector('script[src="/wasm/sudoku.js"]')) return;

    window.Module = {
      locateFile: (path: string) => `/wasm/${path}`,
      onRuntimeInitialized: () => setWasmReady(true),
    };
    const script = document.createElement("script");
    script.src = "/wasm/sudoku.js";
    script.onerror = () => console.error("No se pudo cargar sudoku.js");
    document.body.appendChild(script);
  }, []);

  const handleResetBoard = useCallback(() => {
    const newBoard = generateSudoku(30);
    setInitialBoard(newBoard);
    setBoard(newBoard);
  }, []);

  const solve = useCallback(async () => {
    if (!wasmReady || !initialBoard.length) {
      alert("WASM o tablero aún no está listo");
      return;
    }
    const mod = window.Module;
    const ptr = mod._malloc(81 * 4);
    mod.HEAP32.set(initialBoard, ptr / 4);
    const solved = mod._solve_sudoku(ptr);
    const result = Array.from(mod.HEAP32.subarray(ptr / 4, ptr / 4 + 81)) as number[];
    mod._free(ptr);
    if (solved) {
      setBoard(result);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [wasmReady, initialBoard]);

  const getCellStyle = (index: number): React.CSSProperties => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const isOriginal = initialBoard[index] !== 0;
    return {
      alignItems: "center",
      backgroundColor: isOriginal ? "#1e293b" : "#0f172a",
      color: isOriginal ? "#f1f5f9" : "#60a5fa",
      display: "flex",
      fontSize: "20px",
      fontWeight: isOriginal ? "700" : "500",
      height: `${CELL_SIZE}px`,
      justifyContent: "center",
      width: `${CELL_SIZE}px`,
      borderTop: row % 3 === 0 ? "2px solid #94a3b8" : "1px solid #334155",
      borderLeft: col % 3 === 0 ? "2px solid #94a3b8" : "1px solid #334155",
      borderBottom: row === 8 ? "2px solid #94a3b8" : "none",
      borderRight: col === 8 ? "2px solid #94a3b8" : "none",
    };
  };

  return (
    <main style={{
      alignItems: "center",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "24px",
    }}>

      {showConfetti && (
        <div style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "fixed", zIndex: 10 }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <span key={i} style={{
              animation: `fall ${1.5 + (i % 8) * 0.15}s linear forwards`,
              backgroundColor: ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#ef4444", "#a855f7"][i % 6],
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              height: `${8 + (i % 4) * 3}px`,
              left: `${(i * 13) % 100}%`,
              position: "absolute",
              top: "-20px",
              transform: `rotate(${i * 37}deg)`,
              width: `${6 + (i % 3) * 2}px`,
            }} />
          ))}
          <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#f1f5f9", fontSize: "42px", fontWeight: "800", letterSpacing: "-1px", margin: 0 }}>
          Sudoku WASM
        </h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px", minHeight: "20px" }}>
          {!mounted ? "Generando tablero..." : !wasmReady ? "Cargando motor WASM..." : ""}
        </p>
      </div>

      {mounted && (
        <div style={{
          border: "2px solid #94a3b8",
          borderRadius: "8px",
          display: "grid",
          gridTemplateColumns: `repeat(9, ${CELL_SIZE}px)`,
          overflow: "hidden",
        }}>
          {board.map((value, index) => (
            <div key={index} style={getCellStyle(index)}>
              {value !== 0 ? value : ""}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={solve}
          disabled={!wasmReady || !mounted}
          style={{
            backgroundColor: wasmReady && mounted ? "#2563eb" : "#334155",
            border: "none",
            borderRadius: "10px",
            color: wasmReady && mounted ? "white" : "#64748b",
            cursor: wasmReady && mounted ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "700",
            padding: "14px 32px",
            transition: "background-color 0.2s",
          }}
        >
          Resolver
        </button>
        <button
          onClick={handleResetBoard}
          disabled={!mounted}
          style={{
            backgroundColor: "#475569",
            border: "none",
            borderRadius: "10px",
            color: "white",
            cursor: mounted ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "700",
            padding: "14px 32px",
          }}
        >
          Nuevo tablero
        </button>
      </div>

      <p style={{ color: "#475569", fontSize: "12px", margin: 0 }}>
        Números en blanco: pistas originales · Números en azul: resueltos por WASM
      </p>
    </main>
  );
}