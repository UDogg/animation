import React, { useEffect, useRef } from 'react';

const AnimationTwo = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Global shared lock and counter
    let lockAcquired = false;
    let sharedCounter = 0;

    // Critical section dimensions
    const csArea = { x: 300, y: 200, width: 300, height: 450 };

    // Define track paths
    const tracks = [
      { startX: 0, startY: 250, endX: 900, endY: 250 },
      { startX: 0, startY: 350, endX: 900, endY: 350 },
      { startX: 0, startY: 450, endX: 900, endY: 450 },
      { startX: 0, startY: 550, endX: 900, endY: 550 }
    ];

    // Define thread properties; each thread simulates a process
    const threads = [
      { id: 1, x: 0, y: 250, color: "#f39c12", state: "approaching", delay: 1000, timer: 0 },
      { id: 2, x: 0, y: 350, color: "#27ae60", state: "approaching", delay: 2000, timer: 0 },
      { id: 3, x: 0, y: 450, color: "#2980b9", state: "approaching", delay: 3000, timer: 0 },
      { id: 4, x: 0, y: 550, color: "#8e44ad", state: "approaching", delay: 4000, timer: 0 }
    ];

    const threadSpeed = 2.1; // Speed of thread movement
    const csTime = 1428.57; // Time spent in the critical section (ms)
    let lastTimestamp = 0;

    function drawTracks() {
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 2;
      tracks.forEach(track => {
        ctx.beginPath();
        ctx.moveTo(track.startX, track.startY);
        ctx.lineTo(track.endX, track.endY);
        ctx.stroke();
      });
    }

    function drawStatic() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "24px Arial";
      ctx.fillStyle = "#333";
      ctx.fillText("Concurrency Animation: Threads & Critical Section", 150, 40);
      drawTracks();
      ctx.strokeStyle = lockAcquired ? "#d9534f" : "#007acc";
      ctx.lineWidth = 3;
      ctx.strokeRect(csArea.x, csArea.y, csArea.width, csArea.height);
      ctx.font = "18px Arial";
      ctx.fillStyle = "#333";
      ctx.fillText("Critical Section", csArea.x + 20, csArea.y + 30);
      ctx.fillText("Shared Resource Access", csArea.x + 20, csArea.y + 60);
      ctx.font = "20px Arial";
      ctx.fillText("Shared Counter: " + sharedCounter, 600, 50);
    }

    function drawThread(thread) {
      const carWidth = 40;
      const carHeight = 20;
      ctx.fillStyle = thread.color;
      ctx.fillRect(thread.x - carWidth / 2, thread.y - carHeight / 2, carWidth, carHeight);
      ctx.strokeStyle = "#333";
      ctx.strokeRect(thread.x - carWidth / 2, thread.y - carHeight / 2, carWidth, carHeight);
      ctx.font = "12px Arial";
      ctx.fillStyle = "#333";
      ctx.fillText("Thread " + thread.id, thread.x - carWidth / 2, thread.y - carHeight / 2 - 5);
      ctx.fillText(thread.state, thread.x - carWidth / 2, thread.y + carHeight / 2 + 15);
    }

    function resetThreads() {
      threads.forEach(thread => {
        thread.x = 0;
        thread.state = "approaching";
        thread.timer = 0;
      });
      lockAcquired = false;
    }

    function updateThreads(deltaTime) {
      threads.forEach(thread => {
        if (performance.now() < thread.delay) return;
        if (thread.state === "approaching") {
          if (thread.x < csArea.x - 30) {
            thread.x += threadSpeed;
          } else {
            if (!lockAcquired) {
              lockAcquired = true;
              thread.state = "inCS";
              sharedCounter++;
              thread.timer = 0;
            } else {
              thread.state = "waiting";
            }
          }
        } else if (thread.state === "waiting") {
          if (!lockAcquired) {
            thread.state = "approaching";
          }
        } else if (thread.state === "inCS") {
          thread.timer += deltaTime;
          if (thread.timer >= csTime) {
            thread.state = "exiting";
            lockAcquired = false;
          }
        } else if (thread.state === "exiting") {
          if (thread.x < canvas.width - 10) {
            thread.x += threadSpeed;
          } else {
            thread.state = "done";
          }
        }
      });
    }

    function animate(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      drawStatic();
      updateThreads(deltaTime);
      threads.forEach(drawThread);
      if (threads.every(thread => thread.state === "done")) {
        resetThreads();
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="animation-container" style={{ textAlign: 'center', backgroundColor: '#f7f7f7', fontFamily: 'Arial' }}>
      <canvas ref={canvasRef} width="900" height="700" style={{ display: 'block', margin: '20px auto', backgroundColor: '#fff', border: '1px solid #ccc' }}></canvas>
    </div>
  );
};

export default AnimationTwo;
