import React, { useEffect, useRef, useState } from 'react';

const AnimationThree = () => {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(500);
  // Use a ref for the timeline counter so that the effect runs only once.
  const currentTimeRef = useRef(1);

  const timelineLength = 30;
  const numThreads = 4;
  const threadColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];
  const canvasWidth = 600;
  const canvasHeight = 300;
  const threadHeight = canvasHeight / numThreads;
  let executionStates = [];

  const generateExecutionStates = () => {
    executionStates = [];
    for (let i = 0; i < numThreads; i++) {
      let states = Array.from({ length: timelineLength }, () =>
        Math.random() > 0.5 ? 1 : 0
      );
      executionStates.push(states);
    }
    // Force activity for Race Condition (steps 11–20) for threads 1 & 2.
    for (let t = 10; t < 20; t++) {
      executionStates[0][t] = 1;
      executionStates[1][t] = 1;
    }
    // Force activity for Deadlock (steps 21–30) for threads 3 & 4.
    for (let t = 20; t < 30; t++) {
      executionStates[2][t] = 1;
      executionStates[3][t] = 1;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    generateExecutionStates();

    let timeoutId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentTime = currentTimeRef.current;

      // Draw execution timeline for each thread.
      for (let thread = 0; thread < numThreads; thread++) {
        for (let t = 0; t < currentTime; t++) {
          const state = executionStates[thread][t];
          ctx.fillStyle = state ? threadColors[thread] : "#ddd";
          ctx.fillRect(
            t * (canvas.width / timelineLength),
            thread * threadHeight,
            canvas.width / timelineLength,
            threadHeight - 5
          );
        }
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(`Thread ${thread + 1}`, 10, (thread + 1) * threadHeight - 10);
      }

      // Overlay for Race Condition (Steps 11–20)
      if (currentTime >= 11 && currentTime <= 20) {
        const counterX = canvas.width / 2 - 40,
          counterY = 10,
          counterW = 80,
          counterH = 40;
        ctx.fillStyle = "#eee";
        ctx.fillRect(counterX, counterY, counterW, counterH);
        ctx.strokeStyle = "black";
        ctx.strokeRect(counterX, counterY, counterW, counterH);
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText("Shared", counterX + 10, counterY + 15);
        ctx.fillText("Counter", counterX + 5, counterY + 30);
        const blockWidth = canvas.width / timelineLength;
        const currentBlockX = (currentTime - 0.5) * blockWidth;
        const thread1Y = threadHeight / 2;
        const thread2Y = threadHeight + threadHeight / 2;
        const counterCenterX = counterX + counterW / 2;
        const counterCenterY = counterY + counterH / 2;
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentBlockX, thread1Y);
        ctx.lineTo(counterCenterX, counterCenterY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(currentBlockX, thread2Y);
        ctx.lineTo(counterCenterX, counterCenterY);
        ctx.stroke();
        ctx.fillStyle = "green";
        ctx.font = "16px Arial";
        ctx.fillText(
          "Race Condition: Threads 1 & 2 concurrently update a shared variable",
          canvas.width / 2 - 200,
          canvas.height - 30
        );
      }

      // Overlay for Deadlock (Steps 21–30)
      if (currentTime >= 21 && currentTime <= 30) {
        const blockWidth = canvas.width / timelineLength;
        const currentBlockX = (currentTime - 0.5) * blockWidth;
        const thread3Y = 2 * threadHeight + threadHeight / 2;
        const thread4Y = 3 * threadHeight + threadHeight / 2;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentBlockX, thread3Y);
        ctx.lineTo(currentBlockX, thread4Y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(currentBlockX, thread4Y);
        ctx.lineTo(currentBlockX, thread3Y);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(
          "Deadlock: Threads 3 & 4 are waiting for each other's locks",
          canvas.width / 2 - 200,
          canvas.height - 50
        );
      }

      // Draw the Step Counter.
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText("Step: " + currentTime, canvas.width - 100, 20);

      // Increment the timeline counter.
      currentTimeRef.current = currentTime + 1;
      if (currentTimeRef.current > timelineLength) {
        generateExecutionStates();
        currentTimeRef.current = 1;
      }
      timeoutId = setTimeout(draw, speed);
    }
    draw();

    return () => clearTimeout(timeoutId);
  }, [speed]);

  return (
    <div
      className="animation-container"
      style={{
        textAlign: "center",
        backgroundColor: "#f4f4f4",
        fontFamily: "Arial"
      }}
    >
      <h1>Unified Concurrency Simulation</h1>
      <p>
        This animation uses a single timeline to show normal thread execution (steps
        1–10), a race condition between Threads 1 & 2 (steps 11–20), and a deadlock
        between Threads 3 & 4 (steps 21–30).
      </p>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          backgroundColor: "white",
          display: "block",
          margin: "20px auto",
          border: "1px solid black"
        }}
      ></canvas>
      <div className="controls" style={{ marginTop: "20px" }}>
        <label style={{ marginLeft: "20px" }}>
          Speed:
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
          <span>{speed}ms</span>
        </label>
      </div>
      <div
        id="explanation"
        style={{
          marginTop: "20px",
          fontSize: "16px",
          maxWidth: "600px",
          margin: "20px auto",
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc"
        }}
      >
        <strong>Explanation:</strong>
        <br />
        <em>Normal Execution (Steps 1–10):</em> Each row is a thread; colored blocks show
        when the thread is active.
        <br />
        <em>Race Condition (Steps 11–20):</em> Threads 1 & 2 concurrently update a shared variable.
        <br />
        <em>Deadlock (Steps 21–30):</em> Threads 3 & 4 are waiting for each other's locks.
      </div>
    </div>
  );
};

export default AnimationThree;
