import { Mic, MicOff, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "../App";
import { useLang } from "../context/LangContext";
import { useVoiceCommand } from "../context/VoiceCommandContext";

type BotState = "idle" | "listening" | "speaking" | "error";

const HELP_EN =
  "Navigation: Request Pickup, Driver Dashboard, Track Order, Stats, Home. Form fill: say a crop name like Wheat or Rice, a number for quantity, or Pickup from [place] / Drop to [place].";
const HELP_KN =
  "ನ್ಯಾವಿಗೇಷನ್: ಪಿಕ್‌ಅಪ್ ಕೋರಿಕೆ, ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್, ಟ್ರ್ಯಾಕ್, ಅಂಕಿಅಂಶ, ಮುಖಪುಟ. ಫಾರ್ಮ್ ತುಂಬಿಸಲು: ಗೋಧಿ, ಅಕ್ಕಿ, ತರಕಾರಿ, ಹಣ್ಣು ಎಂದು ಹೇಳಿ, ಅಥವಾ ಸಂಖ್ಯೆ ಕಿಲೋ, ಪಿಕ್‌ಅಪ್ [ಸ್ಥಳ], ಡ್ರಾಪ್ [ಸ್ಥಳ].";

function speak(text: string, lang: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
  window.speechSynthesis.speak(utter);
}

// Maps Kannada/English crop words to internal crop values
const CROP_MAP: Array<{
  patterns: RegExp;
  value: string;
  label: string;
  labelKn: string;
}> = [
  {
    patterns: /godhi|godhI|ಗೋಧಿ|wheat|godi/i,
    value: "Wheat",
    label: "Wheat",
    labelKn: "ಗೋಧಿ",
  },
  {
    patterns: /akki|ಅಕ್ಕಿ|rice|bhatta|ಭತ್ತ/i,
    value: "Rice",
    label: "Rice",
    labelKn: "ಅಕ್ಕಿ",
  },
  {
    patterns: /tarkari|ತರಕಾರಿ|vegetable|sabzi/i,
    value: "Vegetables",
    label: "Vegetables",
    labelKn: "ತರಕಾರಿ",
  },
  {
    patterns: /hannu|ಹಣ್ಣು|fruit|phal/i,
    value: "Fruits",
    label: "Fruits",
    labelKn: "ಹಣ್ಣು",
  },
  {
    patterns: /itare|ಇತರೆ|other/i,
    value: "Other",
    label: "Other",
    labelKn: "ಇತರೆ",
  },
];

// Extract a number from text (handles digits + words like ನೂರು, ಐನೂರು)
function extractNumber(text: string): string | null {
  const match = text.match(/(\d+)/);
  if (match) return match[1];
  // Kannada number words
  const knNumbers: Record<string, string> = {
    ಒಂದು: "1",
    ಎರಡು: "2",
    ಮೂರು: "3",
    ನಾಲ್ಕು: "4",
    ಐದು: "5",
    ಹತ್ತು: "10",
    ಇಪ್ಪತ್ತು: "20",
    ಐವತ್ತು: "50",
    ನೂರು: "100",
    ಇನ್ನೂರು: "200",
    ಮುನ್ನೂರು: "300",
    ನಾನ್ನೂರು: "400",
    ಐನೂರು: "500",
    ಆರುನೂರು: "600",
    ಏಳುನೂರು: "700",
    ಎಂಟುನೂರು: "800",
    ಒಂಬತ್ತುನೂರು: "900",
    "ಒಂದು ಸಾವಿರ": "1000",
    ಸಾವಿರ: "1000",
  };
  for (const [word, num] of Object.entries(knNumbers)) {
    if (text.includes(word)) return num;
  }
  return null;
}

// Extract location from phrases like "pickup from X", "ಪಿಕ್‌ಅಪ್ X ಇಂದ"
function extractLocation(text: string, type: "pickup" | "drop"): string | null {
  let match: RegExpMatchArray | null = null;
  if (type === "pickup") {
    match = text.match(
      /(?:pickup|pick up|from|ಇಂದ|ಪಿಕ್‌ಅಪ್|ಪಿಕಪ್|ತೆಗೆ)\s+(?:from\s+)?([\w\s,]+?)(?:\s+(?:to|drop|ಗೆ|$)|$)/i,
    );
    if (!match) match = text.match(/([\w\s,]+?)\s+(?:ಇಂದ|ನಿಂದ)/i);
  } else {
    match = text.match(
      /(?:drop|deliver|to|ಗೆ|ಡ್ರಾಪ್|ತಲುಪಿಸಿ)\s+(?:to\s+)?([\w\s,]+?)$/i,
    );
    if (!match) match = text.match(/([\w\s,]+?)\s+(?:ಗೆ|ಮಂಡಿ)/i);
  }
  return match ? match[1].trim() : null;
}

export function VoiceBot() {
  const { lang } = useLang();
  const { getFormFillers } = useVoiceCommand();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<BotState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<any>(null);
  const stateRef = useRef<BotState>("idle");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isSupported =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  const handleCommand = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      let reply = "";
      let path: string | null = null;
      const fillers = getFormFillers();

      // --- Form fill commands (only when farmer dashboard is open) ---
      if (fillers) {
        // Crop type detection
        for (const crop of CROP_MAP) {
          if (crop.patterns.test(text)) {
            fillers.setCropType(crop.value);
            reply =
              lang === "kn"
                ? `ಬೆಳೆ ${crop.labelKn} ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ`
                : `Crop set to ${crop.label}`;
            setResponse(reply);
            setState("speaking");
            speak(reply, lang);
            setTimeout(() => setState("idle"), 2500);
            return;
          }
        }

        // Quantity detection: "500 kilo", "ಐನೂರು ಕಿಲೋ", "300 kg"
        if (/kilo|kg|ಕಿಲೋ|ಕೆಜಿ|ಪ್ರಮಾಣ|quantity/.test(lower)) {
          const num = extractNumber(text);
          if (num) {
            fillers.setQuantity(num);
            reply =
              lang === "kn"
                ? `ಪ್ರಮಾಣ ${num} ಕಿಲೋ ನಮೂದಿಸಲಾಗಿದೆ`
                : `Quantity set to ${num} kg`;
            setResponse(reply);
            setState("speaking");
            speak(reply, lang);
            setTimeout(() => setState("idle"), 2500);
            return;
          }
        }

        // Pickup location: "pickup from Mysuru", "ಮೈಸೂರಿನಿಂದ ತೆಗೆ"
        if (
          /pickup|pick up|ಪಿಕ್|ತೆಗೆ|ಇಂದ|ನಿಂದ/.test(lower) &&
          !/driver|ಚಾಲಕ/.test(lower)
        ) {
          const loc = extractLocation(text, "pickup");
          if (loc && loc.length > 1) {
            fillers.setPickup(loc);
            reply =
              lang === "kn"
                ? `ಪಿಕ್‌ಅಪ್ ಸ್ಥಳ ${loc} ನಮೂದಿಸಲಾಗಿದೆ`
                : `Pickup location set to ${loc}`;
            setResponse(reply);
            setState("speaking");
            speak(reply, lang);
            setTimeout(() => setState("idle"), 2500);
            return;
          }
        }

        // Drop location: "drop to Bengaluru", "ಬೆಂಗಳೂರಿಗೆ ತಲುಪಿಸಿ"
        if (/drop|deliver|ಡ್ರಾಪ್|ತಲುಪಿಸಿ|ಮಂಡಿ/.test(lower)) {
          const loc = extractLocation(text, "drop");
          if (loc && loc.length > 1) {
            fillers.setDrop(loc);
            reply =
              lang === "kn"
                ? `ಡ್ರಾಪ್ ಸ್ಥಳ ${loc} ನಮೂದಿಸಲಾಗಿದೆ`
                : `Drop location set to ${loc}`;
            setResponse(reply);
            setState("speaking");
            speak(reply, lang);
            setTimeout(() => setState("idle"), 2500);
            return;
          }
        }
      }

      // --- Navigation commands ---
      if (/pickup|farmer|request|ಪಿಕ್|ರೈತ/.test(lower)) {
        path = "/farmer";
        reply =
          lang === "kn" ? "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ" : "Opening Farmer Dashboard";
      } else if (/driver|ಚಾಲಕ/.test(lower)) {
        path = "/driver";
        reply =
          lang === "kn" ? "ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ" : "Opening Driver Dashboard";
      } else if (/track|order|ಆರ್ಡರ್|ಟ್ರ್ಯಾಕ್/.test(lower)) {
        path = "/track";
        reply = lang === "kn" ? "ಟ್ರ್ಯಾಕ್ ಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇನೆ" : "Opening Track Order";
      } else if (/stats|ಅಂಕಿ/.test(lower)) {
        path = "/stats";
        reply =
          lang === "kn" ? "ಅಂಕಿಅಂಶ ಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇನೆ" : "Opening Stats Dashboard";
      } else if (/home|ಮುಖಪುಟ/.test(lower)) {
        path = "/";
        reply = lang === "kn" ? "ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇನೆ" : "Going to Home";
      } else if (/help|ಸಹಾಯ/.test(lower)) {
        reply = lang === "kn" ? HELP_KN : HELP_EN;
      } else if (/hello|hi|ನಮಸ್ಕಾರ/.test(lower)) {
        reply =
          lang === "kn"
            ? "ನಮಸ್ಕಾರ! ನಾನು ಫಾರ್ಮ್‌ಹಾಲ್ ಸಹಾಯಕ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
            : "Hello! I'm FarmHaul Assistant. How can I help you?";
      } else {
        reply =
          lang === "kn"
            ? "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. 'ಸಹಾಯ' ಎನ್ನಿ."
            : "Sorry, I didn't understand. Say 'help' for commands.";
      }

      setResponse(reply);
      setState("speaking");
      speak(reply, lang);

      if (path) {
        setTimeout(() => {
          router.navigate({ to: path as any });
        }, 800);
      }

      setTimeout(() => setState("idle"), 3000);
    },
    [lang, getFormFillers],
  );

  const startListening = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor() as any;
    recognition.lang =
      lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setErrorMessage("");
      setState("listening");
    };
    recognition.onresult = (e: any) => {
      // Use the best transcript from multiple alternatives
      const text = e.results[0][0].transcript;
      setTranscript(text);
      handleCommand(text);
    };
    recognition.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        setErrorMessage(
          lang === "kn"
            ? "ಮೈಕ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮೈಕ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ."
            : "Microphone permission denied. Please allow mic access.",
        );
      } else {
        setErrorMessage(
          lang === "kn" ? "ದೋಷ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." : "Error. Please try again.",
        );
      }
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    };
    recognition.onend = () => {
      if (stateRef.current === "listening") setState("idle");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, handleCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  const handleMicClick = () => {
    if (!open) setOpen(true);
    if (state === "listening") {
      stopListening();
    } else if (state === "idle") {
      setTranscript("");
      setResponse("");
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const langLabel = lang === "kn" ? "ಕನ್ನಡ" : lang === "hi" ? "हिंदी" : "English";
  const fillers = getFormFillers();
  const isOnFarmerDashboard = !!fillers;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      data-ocid="voicebot.panel"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-4 w-72 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  FarmHaul Assistant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                  {langLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  data-ocid="voicebot.close_button"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {isOnFarmerDashboard && (
              <div className="mb-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  {lang === "kn"
                    ? "ಫಾರ್ಮ್ ಮೋಡ್: ಗೋಧಿ, ಅಕ್ಕಿ, ತರಕಾರಿ, ಹಣ್ಣು, [ಸಂಖ್ಯೆ] ಕಿಲೋ ಎಂದು ಹೇಳಿ"
                    : "Form mode: say Wheat, Rice, Vegetables, Fruits, or [number] kg"}
                </p>
              </div>
            )}

            <div className="space-y-2 min-h-[60px]">
              {state === "idle" && !transcript && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                  {lang === "kn" ? "ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ" : "Press the mic and speak"}
                </p>
              )}
              {state === "listening" && (
                <p className="text-xs text-green-600 font-medium animate-pulse text-center py-2">
                  {lang === "kn" ? "ಕೇಳುತ್ತಿದ್ದೇನೆ..." : "Listening..."}
                </p>
              )}
              {state === "error" && (
                <p
                  className="text-xs text-red-500 text-center py-2"
                  data-ocid="voicebot.error_state"
                >
                  {errorMessage ||
                    (lang === "kn"
                      ? "ದೋಷ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
                      : "Error. Please try again.")}
                </p>
              )}
              {transcript && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    {lang === "kn" ? "ನೀವು ಹೇಳಿದ್ದು:" : "You said:"}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    {transcript}
                  </p>
                </div>
              )}
              {response && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg px-3 py-2">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">
                    {lang === "kn" ? "ಉತ್ತರ:" : "Response:"}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {response}
                  </p>
                </div>
              )}
            </div>

            {!isSupported && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                Voice not supported in this browser
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleMicClick}
        whileTap={{ scale: 0.92 }}
        title={
          isSupported
            ? "FarmHaul Voice Assistant"
            : "Voice not supported in this browser"
        }
        data-ocid="voicebot.button"
        className={[
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
          state === "listening"
            ? "bg-green-500 animate-pulse ring-4 ring-green-400"
            : state === "error"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-600 hover:bg-green-700",
        ].join(" ")}
      >
        {state === "error" ? (
          <MicOff className="text-white" size={24} />
        ) : (
          <Mic className="text-white" size={24} />
        )}
      </motion.button>
    </div>
  );
}
