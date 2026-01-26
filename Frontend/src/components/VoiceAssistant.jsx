import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const { setMode } = useContext(ThemeContext);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [hovered, setHovered] = useState(false);

  const routes = {
    home: "/",
    about: "/about",
    contact: "/contact",
    collection: "/collections",
    collections: "/collections",
    product: "/product",
    cart: "/cart",
    wishlist: "/wishlist",
    orders: "/orders",
    profile: "/profile",
    login: "/login",
    signup: "/signup",
  };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace("go to", "")
      .replace("open", "")
      .replace("page", "")
      .replace("enable", "")
      .replace("switch to", "")
      .trim();

  const handleCommand = (raw) => {
    const cmd = normalize(raw);

    // 🎨 THEME
    if (cmd.includes("light")) {
      setMode("light");
      speak("Light mode enabled");
      return;
    }
    if (cmd.includes("dark")) {
      setMode("dark");
      speak("Dark mode enabled");
      return;
    }
    if (cmd.includes("system")) {
      setMode("system");
      speak("System mode enabled");
      return;
    }

    // 🤖 CHATBOT
    if (cmd.includes("open chatbot")) {
      window.dispatchEvent(new CustomEvent("open-chatbot"));
      speak("Chatbot opened");
      return;
    }
    if (cmd.includes("close chatbot")) {
      window.dispatchEvent(new CustomEvent("close-chatbot"));
      speak("Chatbot closed");
      return;
    }

    // 🧭 NAVIGATION
    if (routes[cmd]) {
      navigate(routes[cmd]);
      speak(`Opening ${cmd}`);
      return;
    }

    speak("Sorry, this page does not exist");
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      speak("Voice assistant not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleCommand(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const active = listening || hovered;

  return (
    <button
      onClick={startListening}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Voice Assistant"
      type="button"
      className={`
        fixed right-4 z-[9999]
        w-16 h-16 rounded-full
        flex items-center justify-center
        text-white text-2xl
        transition-all duration-300 ease-out
        shadow-[0_0_25px_rgba(0,0,0,0.35)]
        ${listening ? "scale-110" : "scale-100"}

        /* 📱 MOBILE → MORE UPPER */
        bottom-[140px]

        /* 🖥️ DESKTOP → SAME AS BEFORE */
        md:bottom-24
      `}
      style={{
        background: active
          ? "linear-gradient(120deg,#ff0080,#ff8c00,#faff00,#00ff85,#00cfff,#7a5cff,#ff4fd8)"
          : "linear-gradient(135deg,#06b6d4,#3b82f6)",
        backgroundSize: active ? "400% 400%" : "100% 100%",
        animation: active
          ? "gradientMove 3s ease infinite, pulse 1.4s infinite"
          : "none",
      }}
    >
      🎤

      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
            70% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
            100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          }
        `}
      </style>
    </button>
  );
};

export default VoiceAssistant;
