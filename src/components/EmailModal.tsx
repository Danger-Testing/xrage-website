"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type EmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export function EmailModal({ isOpen, onClose, onComplete }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("Subscribe error:", data.error);
      } else {
        setIsSubmitted(true);
        onComplete();
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    }
    setIsSubmitting(false);
  };

  return createPortal(
    <div
      className="fixed top-0 left-0 w-screen h-screen z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-neutral-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-[90%] shadow-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="text-center">
            <div className="text-4xl mb-4">🔥</div>
            <h2 className="text-white text-2xl font-bold mb-2">You're in!</h2>
            <p className="text-white/70 mb-6">
              We'll let you know when we build something new to destroy.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Keep destroying
            </button>
          </div>
        ) : (
          <>
            <img src="/us.png" alt="us" className="mx-auto mb-4 max-w-[200px]" />
            <h2 className="text-white text-2xl font-bold mb-2 text-center">
              we're danger testing.
            </h2>
            <p className="text-white/70 text-center mb-6">
              we're trying to make the internet fun again. we drop apps like this every week. would mean a lot if you entered your email.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white text-sm border border-white/20 focus:outline-none focus:border-white/40 mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !email.trim()}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              {isSubmitting ? "..." : "Subscribe"}
            </button>
            <button
              onClick={() => {
                onClose();
                onComplete();
              }}
              className="w-full mt-3 text-white/50 hover:text-white/70 transition-colors text-sm"
            >
              skip
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
