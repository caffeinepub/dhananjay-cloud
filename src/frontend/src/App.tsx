import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Contact } from "./backend";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ContactDetail from "./pages/ContactDetail";
import ContactForm from "./pages/ContactForm";
import ContactsList from "./pages/ContactsList";
import LockScreen from "./pages/LockScreen";
import LoginPage from "./pages/LoginPage";
import PinLock from "./pages/PinLock";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type Screen =
  | { name: "lock" }
  | { name: "contacts" }
  | { name: "detail"; contact: Contact }
  | { name: "form"; contact?: Contact };

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const [pinPassed, setPinPassed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: "lock" });

  // Gate 1: static PIN lock
  if (!pinPassed) {
    return (
      <motion.div
        key="pin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PinLock onUnlocked={() => setPinPassed(true)} />
      </motion.div>
    );
  }

  // Gate 2: Internet Identity login
  if (isInitializing) {
    return (
      <div className="phone-frame flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.22 0.05 245)",
              border: "1px solid oklch(0.74 0.16 195 / 0.25)",
            }}
          >
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Dhananjay Cloud</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  // Gate 3: pattern lock
  if (!unlocked) {
    return (
      <LockScreen
        onUnlocked={() => {
          setUnlocked(true);
          setScreen({ name: "contacts" });
        }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {screen.name === "contacts" && (
        <motion.div
          key="contacts"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <ContactsList
            onAdd={() => setScreen({ name: "form" })}
            onSelect={(contact) => setScreen({ name: "detail", contact })}
          />
        </motion.div>
      )}

      {screen.name === "detail" && "contact" in screen && (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
        >
          <ContactDetail
            contact={(screen as { name: "detail"; contact: Contact }).contact}
            onBack={() => setScreen({ name: "contacts" })}
            onEdit={(c) => setScreen({ name: "form", contact: c })}
          />
        </motion.div>
      )}

      {screen.name === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          <ContactForm
            contact={
              "contact" in screen
                ? (screen as { name: "form"; contact?: Contact }).contact
                : undefined
            }
            onBack={() => {
              if ("contact" in screen && screen.contact) {
                setScreen({ name: "detail", contact: screen.contact });
              } else {
                setScreen({ name: "contacts" });
              }
            }}
            onSaved={() => setScreen({ name: "contacts" })}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh bg-background">
        <div
          className="phone-frame"
          style={{
            borderLeft: "1px solid oklch(0.22 0.04 245)",
            borderRight: "1px solid oklch(0.22 0.04 245)",
          }}
        >
          <AppContent />
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.22 0.05 245)",
            border: "1px solid oklch(0.28 0.04 245)",
            color: "oklch(0.94 0.01 250)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
