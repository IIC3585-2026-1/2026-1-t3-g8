"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Module: any;
  }
}

export default function Page() {
  

  const initialBoard = [
    3, 2, 1, 7, 0, 4, 0, 0, 0,
    6, 4, 0, 0, 9, 0, 0, 0, 7,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 4, 5, 9, 0, 0,
    0, 0, 5, 1, 8, 7, 4, 0, 0,
    0, 0, 4, 9, 6, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    2, 0, 0, 0, 7, 0, 0, 1, 9,
    0, 0, 0, 6, 0, 9, 5, 8, 2,
  ];

  const [board, setBoard] = useState(initialBoard);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    window.Module = {
      locateFile: (path: string) => `/wasm/${path}`,
      onRuntimeInitialized: () => {
        console.log("WASM listo");
        setWasmReady(true)
      },
    };

    const script = document.createElement("script");
    script.src = "/wasm/sudoku.js";
    script.onload = () => {
      console.log("sudoku.js cargado");
    };
    script.onerror = () => console.error("No se pudo cargar sudoku.js");
    document.body.appendChild(script);
  }, []);

  const solve = async () => {
    if (!wasmReady) {
      alert("WASM aún no está listo");
      return;
    }

    const mod = window.Module;
    const ptr = mod._malloc(81 * 4);

    mod.HEAP32.set(initialBoard, ptr / 4);
    const solved = mod._solve_sudoku(ptr);

    const result = Array.from(
      mod.HEAP32.subarray(ptr / 4, ptr / 4 + 81)
    ) as number[];

    mod._free(ptr);

    if (solved) {
      setBoard(result);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  };

  const getBorderStyle = (index: number) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    return {
      borderTop: row % 3 === 0 ? "2px solid black" : "1px solid #ccc",
      borderLeft: col % 3 === 0 ? "2px solid black" : "1px solid #ccc",
      borderBottom: row === 8 ? "2px solid black" : "1px solid #ccc",
      borderRight: col === 8 ? "2px solid black" : "1px solid #ccc",
    };
  };

  return (
    <main style={{ alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      {showConfetti && (
        <div style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "fixed", zIndex: 10 }}>
          {Array.from({ length: 60 }).map((_, index) => (
            <span
              key={index}
              style={{
                animation: `fall ${1.8 + (index % 8) * 0.12}s linear forwards`,
                backgroundColor: ["#2563eb", "#f97316", "#22c55e", "#eab308", "#ef4444"][index % 5],
                height: "10px",
                left: `${(index * 17) % 100}%`,
                position: "absolute",
                top: "-20px",
                transform: `rotate(${index * 23}deg)`,
                width: "6px",
              }}
            />
          ))}
          <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(720deg); } }`}</style>
        </div>
      )}

      <h1 style={{ fontSize: "40px", marginBottom: "16px" }}>Sudoku WASM</h1>
      {!wasmReady && <p style={{ color: "#999", marginBottom: "8px" }}>Cargando WASM...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 40px)", marginTop: "16px", marginBottom: "16px" }}>
        {board.map((value, index) => (
          <div
            key={index}
            style={{
              alignItems: "center",
              color: initialBoard[index] === 0 ? "blue" : "white",
              display: "flex",
              height: "40px",
              justifyContent: "center",
              width: "40px",
              ...getBorderStyle(index), // ✅ bordes de bloque 3×3
            }}
          >
            {value === 0 ? "" : value}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={solve}
          disabled={!wasmReady}
          style={{ backgroundColor: wasmReady ? "#111827" : "#9ca3af", border: "none", borderRadius: "8px", color: "white", cursor: wasmReady ? "pointer" : "not-allowed", fontSize: "16px", fontWeight: "bold", padding: "12px 24px" }}
        >
          Resolver
        </button>
        <button
          onClick={() => setBoard(initialBoard)}
          style={{ backgroundColor: "#6b7280", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "16px", fontWeight: "bold", padding: "12px 24px" }}
        >
          Reset
        </button>
      </div>
    </main>
  );
}