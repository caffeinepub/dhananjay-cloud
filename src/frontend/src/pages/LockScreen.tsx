import { Button } from "@/components/ui/button";
import { Lock, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import PatternLock from "../components/PatternLock";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useHasLockPattern,
  useSetLockPattern,
  useVerifyLockPattern,
} from "../hooks/useQueries";
import { hashPattern } from "../utils/patternHash";

interface LockScreenProps {
  onUnlocked: () => void;
}

export default function LockScreen({ onUnlocked }: LockScreenProps) {
  const { data: hasPattern, isLoading } = useHasLockPattern();
  const setLockMutation = useSetLockPattern();
  const verifyMutation = useVerifyLockPattern();
  const { clear } = useInternetIdentity();

  const [step, setStep] = useState<"draw" | "confirm">("draw");
  const [firstHash, setFirstHash] = useState<string>("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [patternError, setPatternError] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSetPattern = async (indices: number[]) => {
    const hash = await hashPattern(indices);
    if (step === "draw") {
      setFirstHash(hash);
      setStep("confirm");
      setStatusMsg("Draw the pattern again to confirm");
    } else {
      if (hash !== firstHash) {
        setPatternError(true);
        setStatusMsg("Patterns don't match. Try again.");
        setTimeout(() => {
          setPatternError(false);
          setStep("draw");
          setFirstHash("");
          setStatusMsg("");
        }, 800);
        return;
      }
      try {
        await setLockMutation.mutateAsync(hash);
        toast.success("Pattern set successfully!");
        onUnlocked();
      } catch {
        toast.error("Failed to save pattern");
      }
    }
  };

  const handleVerifyPattern = async (indices: number[]) => {
    const hash = await hashPattern(indices);
    try {
      const ok = await verifyMutation.mutateAsync(hash);
      if (ok) {
        toast.success("Unlocked!");
        onUnlocked();
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        setPatternError(true);
        setStatusMsg(
          newAttempts >= 3
            ? "Too many failed attempts"
            : `Incorrect pattern (${3 - newAttempts} tries left)`,
        );
        setTimeout(() => setPatternError(false), 600);
      }
    } catch {
      toast.error("Verification error");
    }
  };

  if (isLoading) {
    return (
      <div className="phone-frame flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const isSettingPattern = !hasPattern;
  const onComplete = isSettingPattern ? handleSetPattern : handleVerifyPattern;
  const isPending = setLockMutation.isPending || verifyMutation.isPending;

  return (
    <div className="phone-frame flex flex-col items-center justify-between bg-background px-6 py-10">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[10%] w-[80%] h-[40%] rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.74 0.16 195 / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Top section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 mt-8"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "oklch(0.22 0.05 245)",
            border: "1px solid oklch(0.74 0.16 195 / 0.25)",
            boxShadow: "0 4px 20px oklch(0.74 0.16 195 / 0.15)",
          }}
        >
          <Lock className="w-8 h-8" style={{ color: "oklch(0.74 0.16 195)" }} />
        </div>
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold">
            {isSettingPattern ? "Set Pattern Lock" : "Welcome Back"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isSettingPattern
              ? step === "draw"
                ? "Draw a pattern to secure your vault"
                : statusMsg || "Confirm your pattern"
              : "Draw your pattern to unlock"}
          </p>
        </div>
      </motion.div>

      {/* Pattern Lock */}
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <PatternLock
          onComplete={onComplete}
          disabled={isPending || (failedAttempts >= 3 && !isSettingPattern)}
          error={patternError}
          size={280}
        />

        <AnimatePresence mode="wait">
          {statusMsg && (
            <motion.p
              key={statusMsg}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-center"
              style={{
                color: patternError
                  ? "oklch(0.62 0.22 25)"
                  : "oklch(0.74 0.16 195)",
              }}
            >
              {statusMsg}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center">
          {isSettingPattern
            ? "Connect at least 4 dots"
            : failedAttempts >= 3
              ? "Too many attempts"
              : "Connect at least 4 dots"}
        </p>
      </motion.div>

      {/* Bottom actions */}
      <div className="w-full max-w-xs flex flex-col gap-3 mb-4">
        {!isSettingPattern && failedAttempts >= 3 && (
          <Button
            data-ocid="lock.secondary_button"
            variant="outline"
            className="w-full h-12 rounded-2xl"
            onClick={() => clear()}
            style={{
              borderColor: "oklch(0.62 0.22 25 / 0.5)",
              color: "oklch(0.62 0.22 25)",
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Forgot pattern? Log out
          </Button>
        )}
        {isSettingPattern && step === "confirm" && (
          <Button
            data-ocid="lock.cancel_button"
            variant="ghost"
            className="w-full h-11 rounded-2xl text-muted-foreground"
            onClick={() => {
              setStep("draw");
              setFirstHash("");
              setStatusMsg("");
            }}
          >
            Start over
          </Button>
        )}
      </div>
    </div>
  );
}
