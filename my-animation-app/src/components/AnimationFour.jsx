import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AnimationFour = () => {
  const queueRef = useRef(null);
  const coresRef = useRef(null);
  const lockStatusRef = useRef(null);
  const phaseIndicatorRef = useRef(null);
  const taskLogRef = useRef(null);

  useEffect(() => {
    // CONFIGURATION CONSTANTS
    const numThreads = 20;       // Total number of tasks
    const numCores = 4;          // Number of processing cores
    const TASK_MOVE_DURATION = 2; // Time (in seconds) to move from queue to core
    const REMOVE_DURATION = 2;    // Time to fade out a completed task
    const TASK_ENQUEUE_INTERVAL = 2500; // Add 1 new task every 2.5s
    const COMPLETE_DURATION = 1;  // Color change animation time

    function getRandomCompleteDelay() {
      return Math.floor(Math.random() * 4 + 2);
    }

    // Get DOM elements from refs
    const queueElem = queueRef.current;
    const coresElem = coresRef.current;
    const lockStatusElem = lockStatusRef.current;
    const phaseIndicatorElem = phaseIndicatorRef.current;
    const taskLogElem = taskLogRef.current;

    // STATE VARIABLES
    let activeThreads = 0;
    let taskCounter = 1;
    const coreAvailability = Array(numCores).fill(true);
    const waitingQueue = [];
    let lastLockUpdateTime = 0;
    let currentLockStatus = "";
    let lastPhaseUpdateTime = 0;
    let currentPhase = "";

    function formatTimestamp(date = new Date()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    function safeUpdateLockStatus(newStatus, newColor) {
      const now = performance.now();
      if (currentLockStatus !== newStatus) {
        const elapsed = now - lastLockUpdateTime;
        const delay = elapsed < 2000 ? 2000 - elapsed : 0;
        setTimeout(() => {
          lockStatusElem.textContent = `Lock Status: ${newStatus}`;
          lockStatusElem.style.color = newColor;
          currentLockStatus = newStatus;
          lastLockUpdateTime = performance.now();
        }, delay);
      }
    }

    function safeUpdatePhaseIndicator(newPhase) {
      const now = performance.now();
      if (currentPhase !== newPhase) {
        const elapsed = now - lastPhaseUpdateTime;
        const delay = elapsed < 2000 ? 2000 - elapsed : 0;
        setTimeout(() => {
          phaseIndicatorElem.textContent = `Phase: ${newPhase}`;
          currentPhase = newPhase;
          lastPhaseUpdateTime = performance.now();
        }, delay);
      }
    }

    // Create cores
    const coreElements = [];
    coresElem.innerHTML = "";
    for (let i = 1; i <= numCores; i++) {
      const core = document.createElement('div');
      core.classList.add('core');
      core.textContent = `Core ${i}`;
      coresElem.appendChild(core);
      coreElements.push(core);
    }

    function createThread() {
      const thread = document.createElement('div');
      thread.classList.add('thread');
      thread.textContent = taskCounter++;
      queueElem.appendChild(thread);
      return thread;
    }

    function logTaskEvent(task, event) {
      const timestamp = formatTimestamp();
      const logEntry = document.createElement('div');
      logEntry.textContent = `Task ${task} ${event} at ${timestamp}`;
      taskLogElem.appendChild(logEntry);
      taskLogElem.scrollTop = taskLogElem.scrollHeight;
    }

    function assignTaskToCore(thread, coreIndex) {
      const core = coreElements[coreIndex];
      coreAvailability[coreIndex] = false;
      const coreRect = core.getBoundingClientRect();
      const queueRect = queueElem.getBoundingClientRect();

      gsap.to(thread, {
        duration: TASK_MOVE_DURATION,
        x: coreRect.left - queueRect.left,
        y: coreRect.top - queueRect.top,
        onStart: () => {
          activeThreads++;
          safeUpdateLockStatus("Locked", "red");
          updatePhaseIndicator();
          logTaskEvent(thread.textContent, `entered Core ${coreIndex + 1}`);
        },
        onComplete: () => {
          const completeDelay = getRandomCompleteDelay();
          gsap.to(thread, {
            duration: COMPLETE_DURATION,
            backgroundColor: '#e74c3c',
            delay: completeDelay,
            onComplete: () => {
              logTaskEvent(thread.textContent, `completed at Core ${coreIndex + 1}`);
              gsap.to(thread, {
                duration: REMOVE_DURATION,
                x: 0,
                y: 0,
                opacity: 0,
                onComplete: () => {
                  if (queueElem.contains(thread)) {
                    queueElem.removeChild(thread);
                  }
                  activeThreads--;
                  coreAvailability[coreIndex] = true;
                  safeUpdateLockStatus(activeThreads > 0 ? "Locked" : "Unlocked", activeThreads > 0 ? "red" : "green");
                  updatePhaseIndicator();
                  processNextTask();
                }
              });
            }
          });
        }
      });
    }

    function processNextTask() {
      for (let i = 0; i < numCores; i++) {
        if (coreAvailability[i] && waitingQueue.length > 0) {
          const nextThread = waitingQueue.shift();
          assignTaskToCore(nextThread, i);
        }
      }
      updatePhaseIndicator();
    }

    function updatePhaseIndicator() {
      if (activeThreads === 0 && waitingQueue.length === 0) {
        safeUpdatePhaseIndicator("Idle");
      } else if (activeThreads < numCores && waitingQueue.length > 0) {
        safeUpdatePhaseIndicator("Growing");
      } else if (activeThreads === numCores) {
        safeUpdatePhaseIndicator("At Capacity");
      } else if (activeThreads > numCores) {
        safeUpdatePhaseIndicator("Overloaded");
      } else {
        safeUpdatePhaseIndicator("Shrinking");
      }
    }

    const taskCreatorInterval = setInterval(() => {
      if (taskCounter <= numThreads) {
        const newThread = createThread();
        waitingQueue.push(newThread);
        processNextTask();
      } else {
        clearInterval(taskCreatorInterval);
      }
    }, TASK_ENQUEUE_INTERVAL);
  }, []);

  return (
    <div className="animation-container" style={{ textAlign: 'center', fontFamily: 'Arial', margin: '20px' }}>
      <h1>Concurrency Visualization (Staggered)</h1>
      <div
        ref={queueRef}
        id="queue"
        style={{ display: 'flex', marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}
      ></div>
      <div ref={coresRef} id="cores" style={{ marginTop: '200px', display: 'flex' }}></div>
      <div ref={lockStatusRef} id="lockStatus" style={{ marginTop: '10px', fontSize: '16px' }}>
        Lock Status: Unlocked
      </div>
      <div ref={phaseIndicatorRef} id="phaseIndicator" style={{ marginTop: '10px', fontSize: '16px' }}>
        Phase: Idle
      </div>
      <div
        ref={taskLogRef}
        id="taskLog"
        style={{
          marginTop: '10px',
          maxHeight: '150px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px'
        }}
      >
        Task Completion Log:
      </div>
      <div id="legend" style={{ position: 'fixed', bottom: '10px', right: '10px', border: '1px solid #ccc', padding: '5px', width: '300px', backgroundColor: '#f9f9f9' }}>
        <h2>Legend</h2>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '5px' }}><strong>Lock Status: Locked</strong> - At least one task is running.</li>
          <li style={{ marginBottom: '5px' }}><strong>Lock Status: Unlocked</strong> - No tasks are running.</li>
          <li style={{ marginBottom: '5px' }}><strong>Phase: Idle</strong> - No tasks in the system (running or waiting).</li>
          <li style={{ marginBottom: '5px' }}><strong>Phase: Growing</strong> - Some tasks are running and there are tasks waiting in the queue.</li>
          <li style={{ marginBottom: '5px' }}><strong>Phase: At Capacity</strong> - All cores are busy with tasks.</li>
          <li style={{ marginBottom: '5px' }}><strong>Phase: Overloaded</strong> - More tasks are running than there are cores available.</li>
          <li style={{ marginBottom: '5px' }}><strong>Phase: Shrinking</strong> - Tasks are completing and the system is winding down.</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationFour;
