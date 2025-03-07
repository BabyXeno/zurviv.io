(function () {
  // ----- Configuration -----
  const SMOOTHING_WINDOW = 1000; // Milliseconds for smoothing analysis
  const JERK_THRESHOLD = 50000; // Example threshold, needs tuning
  const SNAP_THRESHOLD = 2.0; // Radians per second, needs tuning
  const REACTION_TIME_THRESHOLD = 100; // Milliseconds, needs tuning
  const WEIGHT_SMOOTHING = 0.2; // Reduced weight
  const WEIGHT_SNAP = 0.2; // Reduced weight
  const WEIGHT_REACTION = 0.1; // Reduced weight
  const WEIGHT_TRAJECTORY = 0.5; // Added weight for trajectory
  const TRAJECTORY_DEVIATION_THRESHOLD = 50; // Pixels, needs tuning
  const LAG_COMPENSATION_TIME = 100; // ms - Adjust Based on Typical Lag
  const FLICK_TIME_WINDOW = 150; // ms - Adjust Based on flick Speed
  const SUSPICIOUS_SCORE_THRESHOLD = 0.75;

  // ----- Data Structures -----
  const playerAimbotData = {}; 

  // ----- Utility Functions -----
  function now() {
    return performance.now();
  }

  function calculateDistance(x1, y1, x2, y2) {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
  }

  // ----- Core Aim Analysis Functions -----
  function analyzeSmoothing(playerData) {
    const accelerationsX = playerData.mouseHistory.map((m) => m.ax);
    const accelerationsY = playerData.mouseHistory.map((m) => m.ay);

    if (accelerationsX.length < 2) {
      return 0; 
    }

    const stdDevX = standardDeviation(accelerationsX);
    const stdDevY = standardDeviation(accelerationsY);
    playerData.smoothingScore =
      1 - normalizeValue((stdDevX + stdDevY) / 2, 0, JERK_THRESHOLD); 

    return playerData.smoothingScore;
  }

  function analyzeTargetLock(playerData) {
    let snaps = 0;
    for (let i = 1; i < playerData.mouseHistory.length; i++) {
      if (now() - playerData.mouseHistory[i].timestamp < FLICK_TIME_WINDOW) {
        continue;
      }
      const angularVelocity = Math.abs(playerData.mouseHistory[i].angularVelocity);
      if (angularVelocity > SNAP_THRESHOLD) {
        snaps++;
      }
    }

    playerData.snapScore = 1 - normalizeValue(snaps, 0, 5);

    return playerData.snapScore;
  }

  function analyzeReactionTime(playerData) {
    if (playerData.reactionTimes.length === 0) {
      return 0; 
    }

    const avgReactionTime =
      playerData.reactionTimes.reduce((a, b) => a + b, 0) /
      playerData.reactionTimes.length; 
    const adjustedReactionTime = Math.max(0, avgReactionTime - LAG_COMPENSATION_TIME);
    playerData.reactionScore = 1 - normalizeValue(adjustedReactionTime, 0, REACTION_TIME_THRESHOLD);
    return playerData.reactionScore;
  }

  function analyzeTrajectory(player, mouseX, mouseY) {
    // 1. Get Bullet Trajectory:
    const trajectoryData = getBulletTrajectory(player, LAG_COMPENSATION_TIME);

    if (!trajectoryData) {
      return 0; 
    }

    const {
      targetX,
      targetY
    } = trajectoryData; 
    const deviation = calculateDistance(mouseX, mouseY, targetX, targetY);

    const trajectoryScore = 1 - normalizeValue(deviation, 0, TRAJECTORY_DEVIATION_THRESHOLD);

    return trajectoryScore;
  }

  // ----- Main Analysis Function -----
  function analyzeAim(player, x, y) {
    if (!playerAimbotData[player.__id]) {
      playerAimbotData[player.__id] = {
        mouseHistory: [],
        lastTimestamp: now(),
        x: x,
        y: y,
        velocityX: 0, 
        velocityY: 0,
        reactionTimes: [],
        smoothingScore: 0,
        snapScore: 0,
        reactionScore: 0,
        trajectoryScore: 0,
        isSuspicious: false,
      };
    }

    const playerData = playerAimbotData[player.__id];
    const currentTime = now();
    const deltaTime = (currentTime - playerData.lastTimestamp) / 1000;

    const velocityX = (x - playerData.x) / deltaTime;
    const velocityY = (y - playerData.y) / deltaTime;
    const accelerationX = (velocityX - playerData.velocityX) / deltaTime;
    const accelerationY = (velocityY - playerData.velocityY) / deltaTime;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const angle = Math.atan2(y - centerY, x - centerX);
    const prevAngle = Math.atan2(playerData.y - centerY, playerData.x - centerX);
    const angularVelocity = (angle - prevAngle) / deltaTime;

    playerData.mouseHistory.push({
      x,
      y,
      vx: velocityX,
      vy: velocityY,
      ax: accelerationX,
      ay: accelerationY,
      angularVelocity: angularVelocity,
      timestamp: currentTime,
    });

    if (playerData.mouseHistory.length > 100) {
      playerData.mouseHistory.shift(); 
    }

    playerData.velocityX = velocityX;
    playerData.velocityY = velocityY;
    playerData.x = x;
    playerData.y = y;
    playerData.lastTimestamp = currentTime;
    const smoothingScore = analyzeSmoothing(playerData);
    const snapScore = analyzeTargetLock(playerData);
    const reactionScore = analyzeReactionTime(playerData);
    const trajectoryScore = analyzeTrajectory(player, x, y);

    // Weighted Scoring
    const suspiciousScore =
      WEIGHT_SMOOTHING * smoothingScore +
      WEIGHT_SNAP * snapScore +
      WEIGHT_REACTION * reactionScore +
      WEIGHT_TRAJECTORY * trajectoryScore; 

    playerData.isSuspicious = suspiciousScore > SUSPICIOUS_SCORE_THRESHOLD;

    if (playerData.isSuspicious) {
      console.warn(`Player ${player.__id} is highly suspicious of aimbotting! Score: ${suspiciousScore.toFixed(2)}`);
    }
  }

  // ----- Game Specific Data -----
  function getBulletTrajectory(player, lagCompensation) {
    if (!player.isFiring) {
      return null
    }
    const adjustedTime = now() - lagCompensation;

    if (!window.lastAimPos) {
      return null
    }
    return {
      targetX: window.lastAimPos.clientX,
      targetY: window.lastAimPos.clientY,
    }
  }

  let lastTime = Date.now()
  let showing = false
  let timer = null
  function esp () {
    if (!(window.game?.ws && window.game?.activePlayer?.localData?.curWeapIdx != null))
      return
    const player = window.game.activePlayer

    try {
      let elapsed = (Date.now() - lastTime) / 1000;

    } catch (err) {

    }

  }
  // ----- Event Listeners & Game Integration (Placeholder) -----
  // adapt this to  game's event system

  // Example: Listen for mouse move events
  window.addEventListener("mousemove", (event) => {
    if (window.game && window.game.activePlayer) {
      const x = event.clientX;
      const y = event.clientY;
      analyzeAim(window.game.activePlayer, x, y);
    }
  });

  function trackReactionTime(player, targetAppearedTime) {
    if (!playerAimbotData[player.__id]) return;
    const reactionTime = now() - targetAppearedTime;
    playerAimbotData[player.__id].reactionTimes.push(reactionTime);
    if (playerAimbotData[player.__id].reactionTimes.length > 20) {
      playerAimbotData[player.__id].reactionTimes.shift();
    }
  }

  function onTargetAppeared(player) {
    trackReactionTime(player, now());
  }

  function resetAimbotDataForPlayer(playerId) {
    delete playerAimbotData[playerId];
  }

  // ----- Helper Functions (Statistical) -----
  function average(data) {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  function standardDeviation(data) {
    const avg = average(data);
    const squareDiffs = data.map((value) => (value - avg) ** 2);
    const avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  function normalizeValue(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  // ----- Anti-Cheat Code Starts Here -----
  function detectAimbotUse() {
    const keys = Object.keys(playerAimbotData);
    keys.forEach((el) => {
      if (playerAimbotData[el].isSuspicious === true) {
        console.warn(`Player ${el} is highly suspicious of aimbotting!`);
      }
    });
  }
  setInterval(detectAimbotUse, 2000);
})();
