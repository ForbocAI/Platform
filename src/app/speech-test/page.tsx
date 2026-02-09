"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./speech-test.css";

/**
 * Identical implementation of MDN speak-easy-synthesis:
 * https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/
 */
export default function SpeechTestPage() {
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceSelectRef = useRef<HTMLSelectElement>(null);

  const populateVoiceList = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const list = window.speechSynthesis.getVoices().sort((a, b) => {
      const aname = a.name.toUpperCase();
      const bname = b.name.toUpperCase();
      if (aname < bname) return -1;
      if (aname === bname) return 0;
      return 1;
    });
    setVoices(list);
  };

  useEffect(() => {
    populateVoiceList();
    if (typeof window !== "undefined" && window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, []);

  const speak = () => {
    setMessage(null);
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setMessage("Speech synthesis not supported in this browser.");
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      setMessage("Already speaking. Wait for it to finish.");
      return;
    }
    const txt = (inputRef.current?.value?.trim() ?? "").trim();
    const toSpeak = txt || "Please enter some text above to hear it.";
    if (!txt) setMessage("No text entered — saying: “Please enter some text above to hear it.”");

    const utterThis = new SpeechSynthesisUtterance(toSpeak);
    utterThis.onend = () => console.log("SpeechSynthesisUtterance.onend");
    utterThis.onerror = (e) => {
      console.error("SpeechSynthesisUtterance.onerror", e);
      setMessage(`Speech failed: ${e.error ?? "unknown error"}`);
    };

    const selectedName = voiceSelectRef.current?.selectedOptions?.[0]?.getAttribute("data-name");
    if (selectedName) {
      const voice = voices.find((v) => v.name === selectedName);
      if (voice) utterThis.voice = voice;
    }
    utterThis.pitch = pitch;
    utterThis.rate = rate;
    synth.speak(utterThis);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    speak();
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    speak();
  };

  return (
    <div className="speech-test min-h-screen bg-white text-black">
      <div className="max-w-[800px] mx-auto min-h-[90vh]">
        <h1 className="font-sans text-center py-5">Speech synthesiser</h1>
        <p className="font-sans text-center py-5">
          Enter some text in the input below and press return or the &quot;play&quot; button to
          hear it. Change voices using the dropdown menu.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="txt">Enter text</label>
          <input
            id="txt"
            type="text"
            className="txt"
            ref={inputRef}
            placeholder="Type something to hear it spoken"
            aria-label="Enter text"
          />

          <div>
            <label htmlFor="rate">Rate</label>
            <input
              type="range"
              min={0.5}
              max={2}
              value={rate}
              step={0.1}
              id="rate"
              onChange={(e) => setRate(Number(e.target.value))}
              aria-label="Rate"
            />
            <div className="rate-value">{rate}</div>
            <div className="clearfix" />
          </div>

          <div>
            <label htmlFor="pitch">Pitch</label>
            <input
              type="range"
              min={0}
              max={2}
              value={pitch}
              step={0.1}
              id="pitch"
              onChange={(e) => setPitch(Number(e.target.value))}
              aria-label="Pitch"
            />
            <div className="pitch-value">{pitch}</div>
            <div className="clearfix" />
          </div>

          <select
            ref={voiceSelectRef}
            aria-label="Voice"
            onChange={() => speak()}
          >
            {voices.length === 0 && (
              <option value="">Loading voices…</option>
            )}
            {voices.map((v, i) => (
              <option
                key={`${v.name}-${v.lang}-${i}`}
                value={v.name}
                data-lang={v.lang}
                data-name={v.name}
              >
                {v.name} ({v.lang}){v.default ? " -- DEFAULT" : ""}
              </option>
            ))}
          </select>

          <div className="controls">
            <button id="play" type="submit" onClick={handlePlayClick}>
              Play
            </button>
          </div>
        </form>

        {message && (
          <p className="text-center mt-4 font-sans text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 max-w-[800px] mx-auto">
            {message}
          </p>
        )}

        <p className="text-center mt-8 font-sans">
          <Link href="/" className="text-blue-600 underline">
            ← Back to game
          </Link>
        </p>
      </div>
    </div>
  );
}
