"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for IPFS image caching
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in browser (not SSR)
    if (typeof window === "undefined") return;

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.log("[Service Worker] Not supported in this browser");
      return;
    }

    // Check if we're in production or localhost (service workers require HTTPS or localhost)
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const isHttps = window.location.protocol === "https:";

    if (!isLocalhost && !isHttps) {
      console.log(
        "[Service Worker] Service workers require HTTPS (or localhost)"
      );
      return;
    }

    // Register the service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "[Service Worker] Registration successful:",
          registration.scope
        );

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available, reload to activate
                console.log(
                  "[Service Worker] New version available. Reload to update."
                );
                // Optionally show a toast/notification to user
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("[Service Worker] Registration failed:", error);
      });

    // Listen for messages from service worker (optional, for debugging)
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("[Service Worker] Message from SW:", event.data);
    });
  }, []);

  // This component doesn't render anything
  return null;
}

