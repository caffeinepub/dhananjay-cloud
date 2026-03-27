import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Contact, Phone } from "../backend";
import { useCreateContact, useUpdateContact } from "../hooks/useQueries";

interface EmailEntry {
  email: string;
  contactLabel: string;
}
interface PhoneEntry extends Phone {
  _key: string;
}
interface EmailEntryKeyed extends EmailEntry {
  _key: string;
}
interface ContactFormProps {
  contact?: Contact;
  onBack: () => void;
  onSaved: () => void;
}

const DEFAULT_ADDRESS = {
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

let keyCounter = 0;
function nextKey() {
  return String(++keyCounter);
}

export default function ContactForm({
  contact,
  onBack,
  onSaved,
}: ContactFormProps) {
  const isEditing = !!contact;
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const [name, setName] = useState(contact?.name ?? "");
  const [phones, setPhones] = useState<PhoneEntry[]>(
    contact?.phones.length
      ? contact.phones.map((p) => ({ ...p, _key: nextKey() }))
      : [{ number: "", contactLabel: "mobile", _key: nextKey() }],
  );
  const [emails, setEmails] = useState<EmailEntryKeyed[]>(
    contact?.emails.length
      ? contact.emails.map((e) => ({ ...e, _key: nextKey() }))
      : [{ email: "", contactLabel: "personal", _key: nextKey() }],
  );
  const [address, setAddress] = useState(contact?.address ?? DEFAULT_ADDRESS);
  const [birthday, setBirthday] = useState(contact?.birthday ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [nameError, setNameError] = useState("");

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError("");
    const payload: Contact = {
      id: contact?.id ?? 0n,
      name: name.trim(),
      phones: phones
        .filter((p) => p.number.trim())
        .map(({ _key: _k, ...p }) => p),
      emails: emails
        .filter((e) => e.email.trim())
        .map(({ _key: _k, ...e }) => e),
      address,
      birthday: birthday || undefined,
      notes,
      createdAt: contact?.createdAt ?? 0n,
      updatedAt: 0n,
    };
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(payload);
        toast.success("Contact updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Contact added");
      }
      onSaved();
    } catch {
      toast.error(
        isEditing ? "Failed to update contact" : "Failed to add contact",
      );
    }
  };

  const addPhone = () =>
    setPhones((p) => [
      ...p,
      { number: "", contactLabel: "mobile", _key: nextKey() },
    ]);
  const removePhone = (key: string) =>
    setPhones((p) => p.filter((x) => x._key !== key));
  const updatePhone = (key: string, field: keyof Phone, value: string) =>
    setPhones((prev) =>
      prev.map((p) => (p._key === key ? { ...p, [field]: value } : p)),
    );

  const addEmail = () =>
    setEmails((e) => [
      ...e,
      { email: "", contactLabel: "personal", _key: nextKey() },
    ]);
  const removeEmail = (key: string) =>
    setEmails((e) => e.filter((x) => x._key !== key));
  const updateEmail = (key: string, field: keyof EmailEntry, value: string) =>
    setEmails((prev) =>
      prev.map((e) => (e._key === key ? { ...e, [field]: value } : e)),
    );

  return (
    <div className="phone-frame flex flex-col bg-background">
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 pt-6 pb-4"
        style={{
          background: "oklch(0.13 0.04 245 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.28 0.04 245 / 0.5)",
        }}
      >
        <button
          type="button"
          data-ocid="contact_form.link"
          onClick={onBack}
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.74 0.16 195)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Cancel
        </button>
        <h2 className="font-display font-bold text-lg">
          {isEditing ? "Edit Contact" : "New Contact"}
        </h2>
        <Button
          data-ocid="contact_form.submit_button"
          onClick={handleSave}
          disabled={isPending}
          className="h-9 px-4 rounded-xl text-sm font-semibold"
          style={{
            background: isPending
              ? "oklch(0.5 0.1 195)"
              : "oklch(0.74 0.16 195)",
            color: "oklch(0.12 0.04 245)",
            border: "none",
          }}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <FormSection title="Name">
          <div>
            <Input
              data-ocid="contact_form.input"
              placeholder="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              className="h-11 rounded-xl"
              style={fieldStyle}
            />
            {nameError && (
              <p
                data-ocid="contact_form.error_state"
                className="text-xs mt-1.5"
                style={{ color: "oklch(0.62 0.22 25)" }}
              >
                {nameError}
              </p>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Phone"
          action={
            <button
              type="button"
              onClick={addPhone}
              className="text-xs flex items-center gap-1"
              style={{ color: "oklch(0.74 0.16 195)" }}
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          }
        >
          <div className="space-y-2">
            {phones.map((phone) => (
              <motion.div
                key={phone._key}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 items-center"
              >
                <select
                  value={phone.contactLabel}
                  onChange={(e) =>
                    updatePhone(phone._key, "contactLabel", e.target.value)
                  }
                  className="h-11 px-2 rounded-xl text-sm flex-shrink-0 w-28"
                  style={{ ...fieldStyle, appearance: "none" }}
                >
                  {["mobile", "home", "work", "other"].map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Phone number"
                  type="tel"
                  value={phone.number}
                  onChange={(e) =>
                    updatePhone(phone._key, "number", e.target.value)
                  }
                  className="flex-1 h-11 rounded-xl"
                  style={fieldStyle}
                />
                {phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(phone._key)}
                    className="p-1.5 rounded-full transition-colors hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Email"
          action={
            <button
              type="button"
              onClick={addEmail}
              className="text-xs flex items-center gap-1"
              style={{ color: "oklch(0.74 0.16 195)" }}
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          }
        >
          <div className="space-y-2">
            {emails.map((em) => (
              <motion.div
                key={em._key}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 items-center"
              >
                <select
                  value={em.contactLabel}
                  onChange={(e) =>
                    updateEmail(em._key, "contactLabel", e.target.value)
                  }
                  className="h-11 px-2 rounded-xl text-sm flex-shrink-0 w-28"
                  style={{ ...fieldStyle, appearance: "none" }}
                >
                  {["personal", "work", "other"].map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Email address"
                  type="email"
                  value={em.email}
                  onChange={(e) =>
                    updateEmail(em._key, "email", e.target.value)
                  }
                  className="flex-1 h-11 rounded-xl"
                  style={fieldStyle}
                />
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmail(em._key)}
                    className="p-1.5 rounded-full transition-colors hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Address">
          <div className="space-y-2">
            <Input
              placeholder="Street"
              value={address.street}
              onChange={(e) =>
                setAddress((a) => ({ ...a, street: e.target.value }))
              }
              className="h-11 rounded-xl"
              style={fieldStyle}
            />
            <div className="flex gap-2">
              <Input
                placeholder="City"
                value={address.city}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, city: e.target.value }))
                }
                className="flex-1 h-11 rounded-xl"
                style={fieldStyle}
              />
              <Input
                placeholder="State"
                value={address.state}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, state: e.target.value }))
                }
                className="w-24 h-11 rounded-xl"
                style={fieldStyle}
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="ZIP"
                value={address.zip}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, zip: e.target.value }))
                }
                className="w-28 h-11 rounded-xl"
                style={fieldStyle}
              />
              <Input
                placeholder="Country"
                value={address.country}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, country: e.target.value }))
                }
                className="flex-1 h-11 rounded-xl"
                style={fieldStyle}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Birthday">
          <Input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="h-11 rounded-xl"
            style={{ ...fieldStyle, colorScheme: "dark" }}
          />
        </FormSection>

        <FormSection title="Notes">
          <Textarea
            data-ocid="contact_form.textarea"
            placeholder="Add notes about this contact..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-xl resize-none min-h-[80px]"
            style={fieldStyle}
          />
        </FormSection>

        <div className="h-6" />
      </main>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  background: "oklch(0.18 0.04 245)",
  border: "1px solid oklch(0.28 0.04 245)",
  color: "oklch(0.94 0.01 250)",
};

function FormSection({
  title,
  children,
  action,
}: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </Label>
        {action}
      </div>
      {children}
    </div>
  );
}
