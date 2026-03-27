import { Button } from "@/components/ui/button";
import { Fingerprint, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  { icon: "🔒", text: "Pattern-lock protected" },
  { icon: "📱", text: "Store all your contacts" },
  { icon: "☁️", text: "Decentralized on-chain storage" },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="phone-frame flex flex-col items-center justify-between bg-background px-6 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.74 0.16 195) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.65 0.18 260) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="flex-1" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.05 245), oklch(0.18 0.04 245))",
            boxShadow:
              "0 8px 32px oklch(0.74 0.16 195 / 0.2), inset 0 1px 0 oklch(0.74 0.16 195 / 0.15)",
            border: "1px solid oklch(0.74 0.16 195 / 0.2)",
          }}
        >
          <Shield
            className="w-12 h-12"
            style={{ color: "oklch(0.74 0.16 195)" }}
          />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Dhananjay Cloud
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Your private contacts vault,{" "}
            <span style={{ color: "oklch(0.74 0.16 195)" }}>secured</span>.
          </p>
        </div>
      </motion.div>

      <div className="flex-1" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-xs space-y-3 mb-10"
      >
        {FEATURES.map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "oklch(0.18 0.04 245 / 0.7)",
              border: "1px solid oklch(0.28 0.04 245)",
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm text-foreground/80">{item.text}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-xs"
      >
        <Button
          data-ocid="login.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-14 text-base font-semibold rounded-2xl font-display"
          style={{
            background: isLoggingIn
              ? "oklch(0.5 0.1 195)"
              : "linear-gradient(135deg, oklch(0.74 0.16 195), oklch(0.65 0.18 210))",
            color: "oklch(0.12 0.04 245)",
            border: "none",
            boxShadow: isLoggingIn
              ? "none"
              : "0 4px 20px oklch(0.74 0.16 195 / 0.35)",
          }}
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Login to Continue
            </span>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secured with Internet Identity
        </p>
      </motion.div>

      <p className="mt-8 text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.74 0.16 195)" }}
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
