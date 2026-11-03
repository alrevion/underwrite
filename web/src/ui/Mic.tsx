import { useRef, useState } from "react";
import { api, explain } from "../api";
import { t } from "../i18n";
import { toWav } from "../wav";

const supported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

/** Voice input: records, posts to /api/transcribe, hands text back. Hidden when the browser cannot record. */
export function Mic({ onText, onError }: { onText: (s: string) => void; onError: (s: string) => void }) {
  const [state, setState] = useState<"idle" | "rec" | "busy">("idle");
  const rec = useRef<MediaRecorder | undefined>(undefined);
  if (!supported) return null;

  async function toggle() {
    if (state === "rec") { rec.current?.stop(); return; }
    if (state === "busy") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((x) => x.stop());
        setState("busy");
        try { onText(await api.transcribe(await toWav(new Blob(chunks, { type: mr.mimeType })))); } catch (e) { onError(explain(e)); }
        setState("idle");
      };
      rec.current = mr; mr.start(); setState("rec");
    } catch { onError(t.micDenied); setState("idle"); }
  }
  return (
    <button type="button" className={`btn ghost mic ${state}`} onClick={toggle} aria-pressed={state === "rec"} disabled={state === "busy"}>
      <span className="dot" aria-hidden="true" /> {state === "rec" ? t.stopRec : state === "busy" ? t.transcribing : t.speak}
    </button>
  );
}
