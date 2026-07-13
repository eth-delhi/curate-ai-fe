"use client";

import { useEffect, useState } from "react";

const LOGIN_MESSAGES = [
  "Letting you in...",
  "Just a moment...",
  "I swear it won't be long...",
  "Almost there...",
];

// Cycles through LOGIN_MESSAGES with a typewriter effect: types the message
// out, pauses, deletes it, then moves to the next one and repeats.
export function TypingMessage() {
  const [text, setText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = LOGIN_MESSAGES[messageIndex];
    let delay = isDeleting ? 15 : 22;

    if (!isDeleting && text === current) {
      delay = 650; // hold the full message before deleting
    } else if (isDeleting && text === "") {
      delay = 150; // brief pause before the next message starts typing
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text !== current) {
          setText(current.slice(0, text.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (text !== "") {
          setText(text.slice(0, -1));
        } else {
          setIsDeleting(false);
          setMessageIndex((i) => (i + 1) % LOGIN_MESSAGES.length);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, messageIndex]);

  return (
    <span>
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}
