import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

interface VoiceDictationProps {
  onTranscript: (text: string) => void;
  label?: string;
}

export default function VoiceDictation({ onTranscript, label = "Dictate" }: VoiceDictationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg("Not supported");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop automatically when speaking pauses
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg("Mic permission denied. Allow mic access in your browser or try opening in a new tab.");
        } else if (event.error === 'no-speech') {
          setErrorMsg("No speech detected. Please try again.");
        } else {
          setErrorMsg(`Error: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText && resultText.trim()) {
          onTranscript(resultText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Speech starting failed", err);
      setIsListening(false);
      setErrorMsg("Failed to start microphone.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Automatically clear error message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  if (!isSupported) {
    return (
      <span 
        className="text-slate-400 font-bold text-[10px] flex items-center gap-1 cursor-not-allowed opacity-60" 
        title="Voice dictation is unsupported in this browser environment."
      >
        <Mic size={11} />
        <span>Dictate (N/A)</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`font-bold text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse hover:bg-rose-100'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800'
        }`}
        title={isListening ? "Microphone is recording. Click to stop." : "Click to dictate text using your microphone"}
      >
        {isListening ? (
          <>
            <span className="flex h-1.5 w-1.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            <MicOff size={11} className="stroke-[2.5]" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic size={11} className="text-slate-500 group-hover:text-slate-700" />
            <span>{label}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="absolute right-0 bottom-full mb-1 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-lg z-50 whitespace-nowrap flex items-center gap-1 border border-slate-800 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <AlertCircle size={10} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
