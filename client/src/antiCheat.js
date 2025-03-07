(() => {
  // Function to detect Tampermonkey and legacy scripts
  function detectTampermonkey(): boolean {
    if (
      typeof GM_info !== 'undefined' ||
      typeof GM_xmlhttpRequest !== 'undefined' ||
      (window.hasOwnProperty('Tampermonkey') &&
        (window as any).Tampermonkey.version)
    ) {
      alert('Tampermonkey detected! The game will not run.');
      return true;
    }
    return false;
  }

  // Function to detect Violentmonkey
  function detectViolentmonkey(): boolean {
    if (
      typeof VM !== 'undefined' ||
      (window.hasOwnProperty('Violentmonkey') &&
        (window as any).Violentmonkey.version)
    ) {
      alert('Violentmonkey detected! The game will not run.');
      return true;
    }
    return false;
  }

  // Function to detect Greasemonkey
  function detectGreasemonkey(): boolean {
    if (
      typeof GM !== 'undefined' ||
      (window.hasOwnProperty('Greasemonkey') &&
        (window as any).Greasemonkey.version)
    ) {
      alert('Greasemonkey detected! The game will not run.');
      return true;
    }
    return false;
  }

  // Function to detect Surplus extension
  function detectSurplus(): boolean {
    const surplusID: string = 'mgjbdggfgnbpemalbdjladichlniffgi';
    const extensions: string = window.navigator.userAgent; // This is a placeholder; actual detection may vary
    if (extensions.includes(surplusID)) {
      alert('Surplus extension detected! The game will not run.');
      return true;
    }
    return false;
  }

  // Run the detection
  if (
    detectTampermonkey() ||
    detectViolentmonkey() ||
    detectGreasemonkey() ||
    detectSurplus()
  ) {
    alert('One or more prohibited extensions detected. The game will not load.');
    throw new Error(
      'Tampermonkey, Violentmonkey, Greasemonkey, or Surplus scripts are not allowed',
    );
  }
})();
