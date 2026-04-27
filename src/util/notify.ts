import { spawn } from "node:child_process";
import { platform } from "node:os";

export function notifyUser(title: string, message: string): void {
  const os = platform();
  try {
    if (os === "darwin") {
      const child = spawn(
        "osascript",
        ["-e", `display notification "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"`],
        { detached: true, stdio: "ignore" },
      );
      child.unref();
      return;
    }
    if (os === "linux") {
      const child = spawn("notify-send", [title, message], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      return;
    }
    if (os === "win32") {
      const child = spawn(
        "powershell.exe",
        [
          "-Command",
          `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message.replace(/'/g, "''")}', '${title.replace(/'/g, "''")}')`,
        ],
        { detached: true, stdio: "ignore" },
      );
      child.unref();
      return;
    }
  } catch {
    /* ignore notification failures */
  }
  // Fallback: terminal bell
  process.stderr.write("\x07");
}
