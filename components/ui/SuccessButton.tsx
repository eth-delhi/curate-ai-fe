"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionStatus = "idle" | "loading" | "success";

interface SuccessButtonProps extends Omit<ButtonProps, "children"> {
  status: ActionStatus;
  children: React.ReactNode;
  loadingChildren?: React.ReactNode;
}

/**
 * Button that swaps its label for an animated checkmark (with an expanding
 * ripple ring) on success, instead of firing a toast — the confirmation
 * lives on the control the user just pressed rather than a separate corner
 * notification. Caller owns the `status` state and is responsible for
 * reverting it back to "idle" after a short delay.
 */
export function SuccessButton({
  status,
  children,
  loadingChildren,
  disabled,
  className,
  ...props
}: SuccessButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || status !== "idle"}
      className={cn("relative overflow-hidden", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "success" ? (
          <motion.span
            key="success"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="relative inline-flex h-5 w-5 items-center justify-center"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-current"
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <span className="absolute inset-0 rounded-full border-2 border-current" />
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.span>
        ) : status === "loading" ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            {loadingChildren ?? <Loader2 className="h-4 w-4 animate-spin" />}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

/**
 * Drives a SuccessButton's status: runs `action`, flips to "loading" while
 * it's in flight, "success" for `successDurationMs` on success, then back
 * to "idle" (or calls `onSuccessEnd` at that point, e.g. to reload/close).
 */
export function useActionStatus(successDurationMs = 1400) {
  const [status, setStatus] = React.useState<ActionStatus>("idle");

  const run = React.useCallback(
    async (action: () => Promise<void>, onSuccessEnd?: () => void) => {
      setStatus("loading");
      try {
        await action();
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          onSuccessEnd?.();
        }, successDurationMs);
      } catch (error) {
        setStatus("idle");
        throw error;
      }
    },
    [successDurationMs]
  );

  return { status, run };
}
