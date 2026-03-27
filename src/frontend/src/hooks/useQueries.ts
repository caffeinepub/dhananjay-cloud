import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Contact } from "../backend";
import { useActor } from "./useActor";

export function useListContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasLockPattern() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasLockPattern"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasLockPattern();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Contact) => {
      if (!actor) throw new Error("Not connected");
      return actor.createContact(contact);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Contact) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateContact(contact);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteContact(contactId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useSetLockPattern() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hash: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.setLockPattern(hash);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hasLockPattern"] }),
  });
}

export function useVerifyLockPattern() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (hash: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyLockPattern(hash);
    },
  });
}
