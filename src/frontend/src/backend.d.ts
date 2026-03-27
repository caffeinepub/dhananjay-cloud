import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Address {
    zip: string;
    street: string;
    country: string;
    city: string;
    state: string;
}
export type Time = bigint;
export interface Contact {
    id: bigint;
    name: string;
    createdAt: Time;
    emails: Array<{
        email: string;
        contactLabel: string;
    }>;
    updatedAt: Time;
    birthday?: string;
    address: Address;
    notes: string;
    phones: Array<Phone>;
}
export interface Phone {
    number: string;
    contactLabel: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createContact(contact: Contact): Promise<bigint>;
    deleteContact(contactId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(contactId: bigint): Promise<Contact>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasLockPattern(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listContacts(): Promise<Array<Contact>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setLockPattern(patternHash: string): Promise<void>;
    updateContact(contact: Contact): Promise<void>;
    verifyLockPattern(patternHash: string): Promise<boolean>;
}
