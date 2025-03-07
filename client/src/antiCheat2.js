
function detectAimbot() {
    const mouseMovementThreshold = 0.1; // Example threshold for precision
    let lastMousePosition = { x: 0, y: 0 };
    let suspiciousMovements = 0;

    document.addEventListener('mousemove', (event) => {
        const currentMousePosition = { x: event.clientX, y: event.clientY };
        const deltaX = Math.abs(currentMousePosition.x - lastMousePosition.x);
        const deltaY = Math.abs(currentMousePosition.y - lastMousePosition.y);

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
function kickPlayer() {
    alert('You have been kicked from the game for suspected aimbot usage.');
    // Additional logic to remove the player here
}
function initAntiCheat() {
    detectAimbot();
}
initAntiCheat();
