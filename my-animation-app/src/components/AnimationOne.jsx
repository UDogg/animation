import React, { useEffect, useRef, useState } from 'react';

const AnimationOne = () => {
  const canvasRef = useRef(null);
  const [animationRunning, setAnimationRunning] = useState(true);
  const [speed, setSpeed] = useState(500);
  const [numThreads, setNumThreads] = useState(4);
  const [numCores, setNumCores] = useState(2);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // These variables are internal to the drawing loop.
  let currentTime = 0;
  const timelineLength = 10;
  const threadColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
    "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
    "#bcbd22", "#17becf"
  ];
  let executionStates = [];

  // Helper to generate new random execution states.
  const generateExecutionStates = () => {
    executionStates = [];
    for (let i = 0; i < numThreads; i++) {
      executionStates.push(
        Array.from({ length: timelineLength }, () => (Math.random() > 0.5 ? 1 : 0))
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let threadHeight = canvas.height / numThreads;
    generateExecutionStates();

    let timeoutId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const coreHeight = canvas.height / numCores;

      // Draw CPU cores
      for (let core = 0; core < numCores; core++) {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(0, core * coreHeight, canvas.width, 2);
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(`Core ${core + 1}`, 10, (core + 1) * coreHeight - 10);
      }

      // Draw thread execution states
      for (let thread = 0; thread < numThreads; thread++) {
        let assignedCore = thread % numCores;
        let baseY = assignedCore * coreHeight + (threadHeight / 2);
        for (let time = 0; time < currentTime; time++) {
          let state = executionStates[thread][time];
          ctx.fillStyle = state ? threadColors[thread % threadColors.length] : "#ddd";
          ctx.fillRect(
            time * (canvas.width / timelineLength),
            baseY,
            canvas.width / timelineLength,
            threadHeight - 5
          );
        }
        ctx.fillStyle = "black";
        ctx.fillText(`Thread ${thread + 1}`, 10, baseY + threadHeight / 2 - 10);
      }

      currentTime++;
      if (currentTime > timelineLength) {
        currentTime = 0;
        setElapsedSeconds(0);
      }
      // Update the elapsed time display is handled by a separate interval.
      if (animationRunning) {
        timeoutId = setTimeout(draw, speed);
      }
    }
    draw();

    const intervalId = setInterval(() => {
      if (animationRunning) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [animationRunning, speed, numThreads, numCores]);

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#f4f4f4', fontFamily: 'Arial' }}>
      <h1>Concurrency in Systems Programming</h1>
      <p>This animation demonstrates how multiple threads execute across multiple CPU cores.</p>
      <canvas
        ref={canvasRef}
        width="800"
        height="400"
        style={{ display: 'block', margin: '20px auto', border: '1px solid black', backgroundColor: 'white' }}
      />
      <div className="controls" style={{ marginTop: '20px' }}>
        <button
          onClick={() => {
            setAnimationRunning((prev) => !prev);
          }}
        >
          {animationRunning ? "Pause" : "Play"}
        </button>
        <br /><br />
        <label htmlFor="speedControl">Speed:</label>
        <input
          id="speedControl"
          type="range"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span>{speed}ms</span>
        <br /><br />
        <label htmlFor="threadCount">Threads:</label>
        <input
          id="threadCount"
          type="number"
          min="1"
          max="10"
          value={numThreads}
          onChange={(e) => setNumThreads(Number(e.target.value))}
        />
        <button onClick={() => {
          // Regenerate states when thread count changes.
          // The useEffect dependency will re-run.
        }}>Update Threads</button>
        <br /><br />
        <label htmlFor="cpuCores">CPU Cores:</label>
        <input
          id="cpuCores"
          type="number"
          min="1"
          max="4"
          value={numCores}
          onChange={(e) => setNumCores(Number(e.target.value))}
        />
        <button onClick={() => { /* Re-render handled by state update */ }}>Update Cores</button>
        <br /><br />
        <p>Elapsed Time: {elapsedSeconds} seconds</p>
        <br />
        <button onClick={() => {
          // Here you might want to save executionStates, numThreads, and numCores to localStorage.
          alert("Execution state saved!");
        }}>💾 Save Execution State</button>
        <button onClick={() => {
          // And here you would load them.
          alert("Execution state loaded!");
        }}>📂 Load Execution State</button>
      </div>
    </div>
  );
};

export default AnimationOne;
