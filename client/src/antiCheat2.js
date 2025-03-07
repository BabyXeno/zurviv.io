function detectAimbot(): void {
    const mouseMovementThreshold: number = 0.1; // Example threshold for precision
    let lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
    let suspiciousMovements: number = 0;
  
    document.addEventListener('mousemove', (event: MouseEvent) => {
      const currentMousePosition: { x: number; y: number } = {
        x: event.clientX,
        y: event.clientY,
      };
      const deltaX: number = Math.abs(
        currentMousePosition.x - lastMousePosition.x,
      );
      const deltaY: number = Math.abs(
        currentMousePosition.y - lastMousePosition.y,
      );
  
      if (deltaX < mouseMovementThreshold && deltaY < mouseMovementThreshold) {
        suspiciousMovements++;
        if (suspiciousMovements > 10) {
          console.log('Aimbot detected! Kicking player...');
          kickPlayer();
        }
      } else {
        suspiciousMovements = 0;
      }
  
      lastMousePosition = currentMousePosition;
    });
  }
  
  function kickPlayer(): void {
    alert('You have been kicked from the game for suspected aimbot usage.');
    // Additional logic to remove the player here
  }
  
  function initAntiCheat(): void {
    detectAimbot();
  }
  
  initAntiCheat();
  