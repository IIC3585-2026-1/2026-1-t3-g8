"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Module: any;
    HEAP32: Int32Array;
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

  useEffect(() => {
    window.Module = {
      locateFile: (path: string) => `/wasm/${path}`,
      onRuntimeInitialized: () => {
        console.log("WASM listo");
      },
    };

    const script = document.createElement("script");
    script.src = "/wasm/sudoku.js";
    script.onload = () => {
      console.log("sudoku.js cargado");
    };
    document.body.appendChild(script);
  }, []);

  const solve = async () => {
    const ptr = window.Module._malloc(81 * 4);

    window.HEAP32.set(initialBoard, ptr / 4);

    const solved = window.Module._solve_sudoku(ptr);

    const result = Array.from(
      window.HEAP32.subarray(ptr / 4, ptr / 4 + 81)
    );

    window.Module._free(ptr);

    console.log("resuelto?", solved);
    console.log(result);

    if (solved) {
      setBoard(result);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  };


  return <main
    style={{
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "100vh",
    }}
  >
    {showConfetti && (
      <div
        style={{
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          position: "fixed",
          zIndex: 10,
        }}
      >
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
        <style>
          {`
            @keyframes fall {
              to {
                transform: translateY(110vh) rotate(720deg);
              }
            }
          `}
        </style>
      </div>
    )}
    <h1 style={{ fontSize: "40px", marginBottom: "16px" }}>Sudoku WASM</h1>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(9, 40px)",
        gap: "2px",
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      {board.map((value, index) => (
        <div
          key={index}
          style={{
            alignItems: "center",
            border: "1px solid black",
            color: initialBoard[index] === 0 ? "blue" : "black",
            display: "flex",
            height: "40px",
            justifyContent: "center",
            width: "40px",
          }}
        >
          {value === 0 ? "" : value}
        </div>
      ))}
    </div>
    <div>
      <button
        onClick={() => {solve()}}
        style={{
          backgroundColor: "#111827",
          border: "none",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          padding: "12px 24px",
        }}
      >
        Resolver
      </button>
    </div>
  </main>;
}
