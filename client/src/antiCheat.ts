export class AntiCheat {
  detectTampermonkey(): boolean {
    if (
      typeof GM_info !== "undefined" ||
      typeof GM_xmlhttpRequest !== "undefined" ||
      (window.hasOwnProperty("Tampermonkey") &&
        (window as any).Tampermonkey.version)
    ) {
      alert("Tampermonkey detected! The game will not run.");
      return true;
    }
    return false;
  }

  detectViolentmonkey(): boolean {
    if (
      typeof VM !== "undefined" ||
      (window.hasOwnProperty("Violentmonkey") &&
        (window as any).Violentmonkey.version)
    ) {
      alert("Violentmonkey detected! The game will not run.");
      return true;
    }
    return false;
  }

  detectGreasemonkey(): boolean {
    if (
      typeof GM !== "undefined" ||
      (window.hasOwnProperty("Greasemonkey") &&
        (window as any).Greasemonkey.version)
    ) {
      alert("Greasemonkey detected! The game will not run.");
      return true;
    }
    return false;
  }

  detectSurplus(): boolean {
    const surplusID: string = "mgjbdggfgnbpemalbdjladichlniffgi";
    const extensions: string = window.navigator.userAgent; // This is a placeholder; actual detection may vary
    if (extensions.includes(surplusID)) {
      alert("Surplus extension detected! The game will not run.");
      return true;
    }
    return false;
  }

  runDetection(): void {
    if (
      this.detectTampermonkey() ||
      this.detectViolentmonkey() ||
      this.detectGreasemonkey() ||
      this.detectSurplus()
    ) {
      alert("One or more prohibited extensions detected. The game will not load.");
      throw new Error(
        "Tampermonkey, Violentmonkey, Greasemonkey, or Surplus scripts are not allowed",
      );
    }
  }
}

