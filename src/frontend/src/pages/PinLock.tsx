import { Delete, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const CORRECT_PIN = "7030";
const DOT_POSITIONS = [0, 1, 2, 3] as const;

interface PinLockProps {
  onUnlocked: () => void;
}

const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export default function PinLock({ onUnlocked }: PinLockProps) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [wrongFlash, setWrongFlash] = useState(false);

  useEffect(() => {
    if (pin.length < 4) return;
    if (pin === CORRECT_PIN) {
      onUnlocked();
    } else {
      setWrongFlash(true);
      setShake(true);
      setErrorMsg("Wrong PIN");
      setTimeout(() => {
        setPin("");
        setShake(false);
        setWrongFlash(false);
      }, 600);
      setTimeout(() => setErrorMsg(""), 1400);
    }
  }, [pin, onUnlocked]);

  const handleKey = (key: string) => {
    if (key === "back") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    setPin((p) => p + key);
  };

  return (
    <div className="phone-frame flex flex-col items-center justify-between bg-background px-6 py-10 min-h-dvh">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-15%] left-[5%] w-[90%] h-[45%] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.74 0.16 195 / 0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Top: logo + title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 mt-8"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "oklch(0.20 0.05 245)",
            border: "1px solid oklch(0.74 0.16 195 / 0.25)",
            boxShadow: "0 4px 20px oklch(0.74 0.16 195 / 0.15)",
          }}
        >
          <Shield
            className="w-8 h-8"
            style={{ color: "oklch(0.74 0.16 195)" }}
          />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Dhananjay Cloud
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter PIN to continue
          </p>
        </div>
      </motion.div>

      {/* Middle: dots + error */}
      <motion.div
        className="flex flex-col items-center gap-5"
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        {/* Dot indicators */}
        <div className="flex items-center gap-5">
          {DOT_POSITIONS.map((i) => {
            const filled = i < pin.length;
            const isError = wrongFlash && filled;
            return (
              <motion.div
                key={`dot-${i}`}
                animate={{ scale: filled ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="w-4 h-4 rounded-full"
                style={{
                  background: isError
                    ? "oklch(0.62 0.22 25)"
                    : filled
                      ? "oklch(0.74 0.16 195)"
                      : "oklch(0.28 0.04 245)",
                  boxShadow:
                    filled && !isError
                      ? "0 0 10px oklch(0.74 0.16 195 / 0.5)"
                      : isError
                        ? "0 0 10px oklch(0.62 0.22 25 / 0.5)"
                        : "none",
                  transition: "background 0.15s ease, box-shadow 0.15s ease",
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium"
              style={{ color: "oklch(0.72 0.18 25)" }}
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Numpad */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-4"
      >
        {NUMPAD.map((key) => {
          if (key === "") {
            return <div key="empty" />;
          }
          if (key === "back") {
            return (
              <button
                key="back"
                type="button"
                data-ocid="pin_lock.button"
                onClick={() => handleKey("back")}
                className="h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: "oklch(0.20 0.04 245)",
                  border: "1px solid oklch(0.28 0.04 245)",
                }}
              >
                <Delete
                  className="w-5 h-5"
                  style={{ color: "oklch(0.74 0.16 195)" }}
                />
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              data-ocid="pin_lock.button"
              onClick={() => handleKey(key)}
              className="h-16 rounded-2xl flex items-center justify-center font-display text-xl font-semibold transition-all active:scale-95"
              style={{
                background: "oklch(0.20 0.04 245)",
                border: "1px solid oklch(0.28 0.04 245)",
                color: "oklch(0.94 0.01 250)",
                boxShadow: "0 2px 8px oklch(0.0 0 0 / 0.2)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.24 0.05 245)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "oklch(0.74 0.16 195 / 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "oklch(0.20 0.04 245)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "oklch(0.28 0.04 245)";
              }}
            >
              {key}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
