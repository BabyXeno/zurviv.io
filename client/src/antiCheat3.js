(() => {
    const SMOOTHING_WINDOW: number = 1000; // Milliseconds for smoothing analysis
    const JERK_THRESHOLD: number = 50000; // Example threshold, needs tuning
    const SNAP_THRESHOLD: number = 2.0; // Radians per second, needs tuning
    const REACTION_TIME_THRESHOLD: number = 100; // Milliseconds, needs tuning
    const WEIGHT_SMOOTHING: number = 0.3;
    const WEIGHT_SNAP: number = 0.4;
    const WEIGHT_REACTION: number = 0.3;
    const SUSPICIOUS_SCORE_THRESHOLD: number = 0.75;
  
    // ----- Data Structures -----
    interface PlayerAimbotData {
      mouseHistory: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        ax: number;
        ay: number;
        angularVelocity: number;
        timestamp: number;
      }[];
      lastTimestamp: number;
      x: number;
      y: number;
      velocityX?: number;
      velocityY?: number;
      reactionTimes: number[];
      smoothingScore: number;
      snapScore: number;
      reactionScore: number;
      isSuspicious: boolean;
    }
  
    const playerAimbotData: { [playerId: string]: PlayerAimbotData } = {};
  
    // ----- Utility Functions -----
    function now(): number {
      return performance.now();
    }
  
    function calculateDistance(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ): number {
      return (x1 - x2) ** 2 + (y1 - y2) ** 2;
    }
  
    // ----- Core Aim Analysis Functions -----
    function analyzeSmoothing(playerData: PlayerAimbotData): number {
      const accelerationsX: number[] = playerData.mouseHistory.map((m) => m.ax);
      const accelerationsY: number[] = playerData.mouseHistory.map((m) => m.ay);
  
      if (accelerationsX.length < 2) {
        return 0;
      }
  
      const stdDevX: number = standardDeviation(accelerationsX);
      const stdDevY: number = standardDeviation(accelerationsY);
      playerData.smoothingScore =
        1 - normalizeValue((stdDevX + stdDevY) / 2, 0, JERK_THRESHOLD);
  
      return playerData.smoothingScore;
    }
  
    function analyzeTargetLock(playerData: PlayerAimbotData): number {
      let snaps: number = 0;
      for (let i: number = 1; i < playerData.mouseHistory.length; i++) {
        const angularVelocity: number = Math.abs(
          playerData.mouseHistory[i].angularVelocity,
        );
        if (angularVelocity > SNAP_THRESHOLD) {
          snaps++;
        }
      }
  
      playerData.snapScore = 1 - normalizeValue(snaps, 0, 5);
  
      return playerData.snapScore;
    }
  
    function analyzeReactionTime(playerData: PlayerAimbotData): number {
      if (playerData.reactionTimes.length === 0) {
        return 0;
      }
  
      const avgReactionTime: number =
        playerData.reactionTimes.reduce((a, b) => a + b, 0) /
        playerData.reactionTimes.length;
      playerData.reactionScore = 1 - normalizeValue(avgReactionTime, 0, REACTION_TIME_THRESHOLD); // Normalized 0 to 1, 0 = instant reaction
      return playerData.reactionScore;
    }
  
    // ----- Main Analysis Function -----
    function analyzeAim(player: any, x: number, y: number): void {
      if (!playerAimbotData[(player as any).__id]) {
        playerAimbotData[(player as any).__id] = {
          mouseHistory: [],
          lastTimestamp: now(),
          x: x,
          y: y,
          reactionTimes: [],
          smoothingScore: 0,
          snapScore: 0,
          reactionScore: 0,
          isSuspicious: false,
        };
      }
  
      const playerData: PlayerAimbotData = playerAimbotData[(player as any).__id];
      const currentTime: number = now();
      const deltaTime: number = (currentTime - playerData.lastTimestamp) / 1000;
  
      const velocityX: number = (x - playerData.x) / deltaTime;
      const velocityY: number = (y - playerData.y) / deltaTime;
      const accelerationX: number =
        (velocityX - (playerData.velocityX || 0)) / deltaTime;
      const accelerationY: number =
        (velocityY - (playerData.velocityY || 0)) / deltaTime;
      const centerX: number = window.innerWidth / 2;
      const centerY: number = window.innerHeight / 2;
  
      const angle: number = Math.atan2(y - centerY, x - centerX);
      const prevAngle: number = Math.atan2(
        playerData.y - centerY,
        playerData.x - centerX,
      );
      const angularVelocity: number = (angle - prevAngle) / deltaTime;
  
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
      const smoothingScore: number = analyzeSmoothing(playerData);
      const snapScore: number = analyzeTargetLock(playerData);
      const reactionScore: number = analyzeReactionTime(playerData);
      const suspiciousScore: number =
        WEIGHT_SMOOTHING * smoothingScore +
        WEIGHT_SNAP * snapScore +
        WEIGHT_REACTION * reactionScore;
  
      playerData.isSuspicious = suspiciousScore > SUSPICIOUS_SCORE_THRESHOLD;
  
      if (playerData.isSuspicious) {
        console.warn(
          `Player ${(player as any)
            .__id} is highly suspicious of aimbotting! Score: ${suspiciousScore.toFixed(
            2,
          )}`,
        );
      }
    }
  
    // ----- Event Listeners & Game Integration (Placeholder) -----
    //adapt this to game's event system
  
    //  Listen for mouse move events and target appearance
    window.addEventListener('mousemove', (event: MouseEvent) => {
      if ((window as any).game && (window as any).game.activePlayer) {
        const x: number = event.clientX;
        const y: number = event.clientY;
        analyzeAim((window as any).game.activePlayer, x, y);
      }
    });
  
    // Example: Track target appearance (needs to be connected to game)
  
    function trackReactionTime(player: any, targetAppearedTime: number): void {
      if (!playerAimbotData[(player as any).__id]) return;
      const reactionTime: number = now() - targetAppearedTime;
      playerAimbotData[(player as any).__id].reactionTimes.push(reactionTime);
      if (playerAimbotData[(player as any).__id].reactionTimes.length > 20) {
        playerAimbotData[(player as any).__id].reactionTimes.shift();
      }
    }
  
    // ----- Helper Functions (Statistical) -----
    function average(data: number[]): number {
      return data.reduce((sum, value) => sum + value, 0) / data.length;
    }
  
    function standardDeviation(data: number[]): number {
      const avg: number = average(data);
      const squareDiffs: number[] = data.map((value) => (value - avg) ** 2);
      const avgSquareDiff: number = average(squareDiffs);
      return Math.sqrt(avgSquareDiff);
    }
  
    function normalizeValue(value: number, min: number, max: number): number {
      return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }
  
    // ----- Game Data Extraction (Placeholder) -----
    //adapt this to game's specific data structures
    function onTargetAppeared(player: any): void {
      trackReactionTime(player, now());
    }
  
    function resetAimbotDataForPlayer(playerId: string): void {
      delete playerAimbotData[playerId];
    }
  
    // ----- Anti-Cheat Code Starts Here -----
    function detectAimbotUse(): void {
      const keys: string[] = Object.keys(playerAimbotData);
      keys.forEach((el) => {
        if (playerAimbotData[el].isSuspicious === true) {
          console.warn(`Player ${el} is highly suspicious of aimbotting!`);
        }
      });
    }
  
    setInterval(detectAimbotUse, 2000);
  })();
  