export class AntiCheat {
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private suspiciousMovements: number = 0;
  private readonly mouseMovementThreshold: number = 0.1; // Example threshold

  detectAimbot(): void {
    document.addEventListener("mousemove", (event: MouseEvent) => {
      const currentMousePosition: { x: number; y: number } = {
        x: event.clientX,
        y: event.clientY,
      };
      const deltaX: number = Math.abs(
        currentMousePosition.x - this.lastMousePosition.x,
      );
      const deltaY: number = Math.abs(
        currentMousePosition.y - this.lastMousePosition.y,
      );

      if (
        deltaX < this.mouseMovementThreshold &&
        deltaY < this.mouseMovementThreshold
      ) {
        this.suspiciousMovements++;
        if (this.suspiciousMovements > 10) {
          console.log("Aimbot detected! Kicking player...");
          this.kickPlayer();
        }
      } else {
        this.suspiciousMovements = 0;
      }

      this.lastMousePosition = currentMousePosition;
    });
  }

  kickPlayer(): void {
    alert("You have been kicked from the game for suspected aimbot usage.");
    // Additional logic to remove the player here
  }

  initAntiCheat(): void {
    this.detectAimbot();
  }
}

