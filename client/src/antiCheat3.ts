export class AntiCheat {
  private readonly SMOOTHING_WINDOW: number = 1000;
  private readonly JERK_THRESHOLD: number = 50000;
  private readonly SNAP_THRESHOLD: number = 2.0;
  private readonly REACTION_TIME_THRESHOLD: number = 100;
  private readonly WEIGHT_SMOOTHING: number = 0.3;
  private readonly WEIGHT_SNAP: number = 0.4;
  private readonly WEIGHT_REACTION: number = 0.3;
  private readonly SUSPICIOUS_SCORE_THRESHOLD: number = 0.75;

  private playerAimbotData: { [playerId: string]: PlayerAimbotData } = {};

  private now(): number {
    return performance.now();
  }

  private calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
  }

  private analyzeSmoothing(playerData: PlayerAimbotData): number {
    const accelerationsX: number[] = playerData.mouseHistory.map((m) => m.ax);
    const accelerationsY: number[] = playerData.mouseHistory.map((m) => m.ay);

    if (accelerationsX.length < 2) {
      return 0;
    }

    const stdDevX: number = this.standardDeviation(accelerationsX);
    const stdDevY: number = this.standardDeviation(accelerationsY);
    playerData.smoothingScore =
      1 -
      this.normalizeValue(
        (stdDevX + stdDevY) / 2,
        0,
        this.JERK_THRESHOLD,
      );

    return playerData.smoothingScore;
  }

  private analyzeTargetLock(playerData: PlayerAimbotData): number {
    let snaps: number = 0;
    for (let i: number = 1; i < playerData.mouseHistory.length; i++) {
      const angularVelocity: number = Math.abs(
        playerData.mouseHistory[i].angularVelocity,
      );
      if (angularVelocity > this.SNAP_THRESHOLD) {
        snaps++;
      }
    }

    playerData.snapScore = 1 - this.normalizeValue(snaps, 0, 5);

    return playerData.snapScore;
  }

  private analyzeReactionTime(playerData: PlayerAimbotData): number {
    if (playerData.reactionTimes.length === 0) {
      return 0;
    }

    const avgReactionTime: number =
      playerData.reactionTimes.reduce((a, b) => a + b, 0) /
      playerData.reactionTimes.length;
    playerData.reactionScore =
      1 -
      this.normalizeValue(
        avgReactionTime,
        0,
        this.REACTION_TIME_THRESHOLD,
      ); // Normalized 0 to 1, 0 = instant reaction
    return playerData.reactionScore;
  }

  private analyzeAim(player: any, x: number, y: number): void {
    if (!this.playerAimbotData[(player as any).__id]) {
      this.playerAimbotData[(player as any).__id] = {
        mouseHistory: [],
        lastTimestamp: this.now(),
        x: x,
        y: y,
        reactionTimes: [],
        smoothingScore: 0,
        snapScore: 0,
        reactionScore: 0,
        isSuspicious: false,
      };
    }

    const playerData: PlayerAimbotData =
      this.playerAimbotData[(player as any).__id];
    const currentTime: number = this.now();
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
    const smoothingScore: number = this.analyzeSmoothing(playerData);
    const snapScore: number = this.analyzeTargetLock(playerData);
    const reactionScore: number = this.analyzeReactionTime(playerData);
    const suspiciousScore: number =
      this.WEIGHT_SMOOTHING * smoothingScore +
      this.WEIGHT_SNAP * snapScore +
      this.WEIGHT_REACTION * reactionScore;

    playerData.isSuspicious = suspiciousScore > this.SUSPICIOUS_SCORE_THRESHOLD;

    if (playerData.isSuspicious) {
      console.warn(
        `Player ${(player as any)
          .__id} is highly suspicious of aimbotting! Score: ${suspiciousScore.toFixed(
          2,
        )}`,
      );
    }
  }

  private trackReactionTime(player: any, targetAppearedTime: number): void {
    if (!this.playerAimbotData[(player as any).__id]) return;
    const reactionTime: number = this.now() - targetAppearedTime;
    this.playerAimbotData[(player as any).__id].reactionTimes.push(
      reactionTime,
    );
    if (this.playerAimbotData[(player as any).__id].reactionTimes.length > 20) {
      this.playerAimbotData[(player as any).__id].reactionTimes.shift();
    }
  }

  private average(data: number[]): number {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  private standardDeviation(data: number[]): number {
    const avg: number = this.average(data);
    const squareDiffs: number[] = data.map((value) => (value - avg) ** 2);
    const avgSquareDiff: number = this.average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  private normalizeValue(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  detectAimbotUse(): void {
    const keys: string[] = Object.keys(this.playerAimbotData);
    keys.forEach((el) => {
      if (this.playerAimbotData[el].isSuspicious === true) {
        console.warn(`Player ${el} is highly suspicious of aimbotting!`);
      }
    });
  }

  init(): void {
    window.addEventListener("mousemove", (event: MouseEvent) => {
      if ((window as any).game && (window as any).game.activePlayer) {
        const x: number = event.clientX;
        const y: number = event.clientY;
        this.analyzeAim((window as any).game.activePlayer, x, y);
      }
    });

    setInterval(this.detectAimbotUse.bind(this), 2000);
  }
}

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
