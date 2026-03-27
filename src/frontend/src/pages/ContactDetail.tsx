import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Contact } from "../backend";
import { useDeleteContact } from "../hooks/useQueries";
import {
  formatPhoneLabel,
  getAvatarColor,
  getInitials,
} from "../utils/patternHash";

interface ContactDetailProps {
  contact: Contact;
  onBack: () => void;
  onEdit: (contact: Contact) => void;
}

export default function ContactDetail({
  contact,
  onBack,
  onEdit,
}: ContactDetailProps) {
  const deleteMutation = useDeleteContact();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(contact.id);
      toast.success("Contact deleted");
      onBack();
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  const hasAddress = Object.values(contact.address).some(Boolean);

  return (
    <div className="phone-frame flex flex-col bg-background">
      <div
        className="relative px-5 pt-6 pb-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.13 0.04 245) 0%, oklch(0.16 0.04 245) 100%)",
          borderBottom: "1px solid oklch(0.28 0.04 245 / 0.5)",
        }}
      >
        <button
          type="button"
          data-ocid="contact_detail.link"
          onClick={onBack}
          className="flex items-center gap-1 text-sm mb-5 transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.74 0.16 195)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Contacts
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: getAvatarColor(contact.name),
              color: "oklch(0.97 0 0)",
              boxShadow: `0 8px 24px ${getAvatarColor(contact.name).replace(")", " / 0.4)")}, 0 0 0 4px oklch(0.13 0.04 245)`,
            }}
          >
            {getInitials(contact.name)}
          </div>
          <h2 className="font-display text-2xl font-bold text-center">
            {contact.name}
          </h2>
        </motion.div>

        <div className="flex gap-3 mt-5 justify-center">
          <Button
            data-ocid="contact_detail.edit_button"
            onClick={() => onEdit(contact)}
            className="flex-1 max-w-[140px] h-11 rounded-2xl font-semibold"
            style={{
              background: "oklch(0.74 0.16 195 / 0.15)",
              color: "oklch(0.74 0.16 195)",
              border: "1px solid oklch(0.74 0.16 195 / 0.3)",
            }}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                data-ocid="contact_detail.delete_button"
                variant="ghost"
                className="flex-1 max-w-[140px] h-11 rounded-2xl font-semibold"
                style={{
                  background: "oklch(0.62 0.22 25 / 0.1)",
                  color: "oklch(0.72 0.18 25)",
                  border: "1px solid oklch(0.62 0.22 25 / 0.25)",
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              data-ocid="contact_detail.dialog"
              style={{
                background: "oklch(0.20 0.04 245)",
                border: "1px solid oklch(0.28 0.04 245)",
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {contact.name} from your vault.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="contact_detail.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="contact_detail.confirm_button"
                  onClick={handleDelete}
                  style={{ background: "oklch(0.62 0.22 25)", color: "white" }}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {contact.phones.length > 0 && (
          <InfoSection icon={<Phone className="w-4 h-4" />} title="Phone">
            {contact.phones.map((p) => (
              <div
                key={`${p.contactLabel}-${p.number}`}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {formatPhoneLabel(p.contactLabel)}
                  </p>
                  <a
                    href={`tel:${p.number}`}
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.74 0.16 195)" }}
                  >
                    {p.number}
                  </a>
                </div>
              </div>
            ))}
          </InfoSection>
        )}

        {contact.emails.length > 0 && (
          <InfoSection icon={<Mail className="w-4 h-4" />} title="Email">
            {contact.emails.map((e) => (
              <div
                key={`${e.contactLabel}-${e.email}`}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {formatPhoneLabel(e.contactLabel)}
                  </p>
                  <a
                    href={`mailto:${e.email}`}
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.74 0.16 195)" }}
                  >
                    {e.email}
                  </a>
                </div>
              </div>
            ))}
          </InfoSection>
        )}

        {hasAddress && (
          <InfoSection icon={<MapPin className="w-4 h-4" />} title="Address">
            <div className="py-2.5">
              <p className="text-sm text-foreground leading-relaxed">
                {[
                  contact.address.street,
                  contact.address.city,
                  contact.address.state,
                  contact.address.zip,
                  contact.address.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </InfoSection>
        )}

        {contact.birthday && (
          <InfoSection icon={<Calendar className="w-4 h-4" />} title="Birthday">
            <div className="py-2.5">
              <p className="text-sm text-foreground">{contact.birthday}</p>
            </div>
          </InfoSection>
        )}

        {contact.notes && (
          <InfoSection icon={<FileText className="w-4 h-4" />} title="Notes">
            <div className="py-2.5">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </p>
            </div>
          </InfoSection>
        )}
      </main>
    </div>
  );
}

function InfoSection({
  icon,
  title,
  children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.18 0.04 245)",
        border: "1px solid oklch(0.28 0.04 245)",
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{
          borderBottom: "1px solid oklch(0.28 0.04 245 / 0.5)",
          color: "oklch(0.74 0.16 195)",
        }}
      >
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div
        className="px-4 divide-y"
        style={{ borderColor: "oklch(0.28 0.04 245 / 0.3)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}
