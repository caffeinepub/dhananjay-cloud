import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudOff, Phone, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Contact } from "../backend";
import { useListContacts } from "../hooks/useQueries";
import { getAvatarColor, getInitials } from "../utils/patternHash";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

interface ContactsListProps {
  onAdd: () => void;
  onSelect: (contact: Contact) => void;
}

export default function ContactsList({ onAdd, onSelect }: ContactsListProps) {
  const { data: contacts = [], isLoading, isError } = useListContacts();
  const [search, setSearch] = useState("");

  const filtered = contacts
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phones.some((p) => p.number.includes(search)),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const grouped = filtered.reduce<Record<string, Contact[]>>((acc, c) => {
    const letter = c.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort();

  return (
    <div className="phone-frame flex flex-col bg-background">
      <header
        className="sticky top-0 z-10 px-5 pt-6 pb-4"
        style={{
          background: "oklch(0.13 0.04 245 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.28 0.04 245 / 0.5)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">
            Dhananjay{" "}
            <span style={{ color: "oklch(0.74 0.16 195)" }}>Cloud</span>
          </h1>
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              background: "oklch(0.74 0.16 195 / 0.15)",
              color: "oklch(0.74 0.16 195)",
              border: "1px solid oklch(0.74 0.16 195 / 0.25)",
            }}
          >
            {contacts.length} contacts
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="contacts.search_input"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl text-sm"
            style={{
              background: "oklch(0.18 0.04 245)",
              border: "1px solid oklch(0.28 0.04 245)",
            }}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4">
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {SKELETON_KEYS.map((k) => (
              <div key={k} className="flex items-center gap-3 px-1 py-2">
                <Skeleton
                  className="w-12 h-12 rounded-full"
                  style={{ background: "oklch(0.22 0.04 245)" }}
                />
                <div className="flex-1 space-y-2">
                  <Skeleton
                    className="h-4 w-32"
                    style={{ background: "oklch(0.22 0.04 245)" }}
                  />
                  <Skeleton
                    className="h-3 w-24"
                    style={{ background: "oklch(0.22 0.04 245)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            data-ocid="contacts.error_state"
            className="flex flex-col items-center gap-3 mt-16 text-center"
          >
            <CloudOff className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">Failed to load contacts</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="contacts.empty_state"
            className="flex flex-col items-center gap-4 mt-16 text-center px-6"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.18 0.04 245)",
                border: "1px solid oklch(0.28 0.04 245)",
              }}
            >
              <Phone className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {search ? "No results found" : "No contacts yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {search
                  ? "Try a different search"
                  : "Tap + to add your first contact"}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            {groupKeys.map((letter) => (
              <div key={letter}>
                <div className="px-1 py-1.5 mt-3">
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: "oklch(0.74 0.16 195)" }}
                  >
                    {letter}
                  </span>
                </div>
                <AnimatePresence>
                  {grouped[letter].map((contact, idx) => (
                    <motion.button
                      key={String(contact.id)}
                      data-ocid={`contacts.item.${idx + 1}`}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => onSelect(contact)}
                      className="w-full flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-card/60 active:bg-card transition-colors text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{
                          background: getAvatarColor(contact.name),
                          color: "oklch(0.97 0 0)",
                          boxShadow: `0 2px 8px ${getAvatarColor(contact.name).replace(")", " / 0.4)")}`,
                        }}
                      >
                        {getInitials(contact.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {contact.name}
                        </p>
                        {contact.phones[0] && (
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.phones[0].number}
                          </p>
                        )}
                      </div>
                      <span className="text-muted-foreground/40 text-lg">
                        ›
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </main>

      <Button
        data-ocid="contacts.primary_button"
        onClick={onAdd}
        className="fixed bottom-6 right-[calc(50%-240px+16px)] w-14 h-14 rounded-full shadow-lg p-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.74 0.16 195), oklch(0.65 0.18 210))",
          boxShadow: "0 6px 24px oklch(0.74 0.16 195 / 0.4)",
          color: "oklch(0.12 0.04 245)",
          border: "none",
        }}
      >
        <Plus className="w-7 h-7" />
      </Button>
    </div>
  );
}
