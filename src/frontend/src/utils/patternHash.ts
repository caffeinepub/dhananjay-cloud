export async function hashPattern(indices: number[]): Promise<string> {
  const str = indices.join("-");
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function formatPhoneLabel(label: string): string {
  if (!label) return "Phone";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const AVATAR_COLORS = [
  "oklch(0.55 0.18 195)",
  "oklch(0.55 0.18 260)",
  "oklch(0.55 0.18 160)",
  "oklch(0.55 0.18 300)",
  "oklch(0.55 0.18 45)",
  "oklch(0.55 0.18 80)",
  "oklch(0.55 0.18 20)",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
