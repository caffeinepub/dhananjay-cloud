import Char "mo:core/Char";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();
  type Phone = { contactLabel : Text; number : Text };

  type Address = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  type Contact = {
    id : Nat;
    name : Text;
    phones : [Phone];
    emails : [{ contactLabel : Text; email : Text }];
    address : Address;
    birthday : ?Text;
    notes : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type UserContacts = {
    nextId : Nat;
    contacts : Map.Map<Nat, Contact>;
  };

  type UserProfile = {
    name : Text;
  };

  module Contact {
    public func compareByName(c1 : Contact, c2 : Contact) : Order.Order {
      Text.compare(c1.name, c2.name);
    };
  };

  // Persistent data structures
  let usersContacts = Map.empty<Principal, UserContacts>();
  let lockPatterns = Map.empty<Principal, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func getUserContacts(user : Principal) : UserContacts {
    switch (usersContacts.get(user)) {
      case (?userContacts) { userContacts };
      case (null) {
        let newUserContacts : UserContacts = { nextId = 1; contacts = Map.empty<Nat, Contact>() };
        usersContacts.add(user, newUserContacts);
        newUserContacts;
      };
    };
  };

  func updateUserContacts(user : Principal, userContacts : UserContacts) {
    usersContacts.add(user, userContacts);
  };

  func getNextId(user : Principal) : Nat {
    let userContacts = getUserContacts(user);
    let nextId = userContacts.nextId;
    let updatedUserContacts = {
      userContacts with
      nextId = nextId + 1;
    };
    updateUserContacts(user, updatedUserContacts);
    nextId;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createContact(contact : Contact) : async Nat {
    requireUser(caller);
    let now = Time.now();
    let newContact : Contact = {
      contact with
      id = getNextId(caller);
      createdAt = now;
      updatedAt = now;
    };

    let userContacts = getUserContacts(caller);
    userContacts.contacts.add(newContact.id, newContact);
    updateUserContacts(caller, userContacts);

    newContact.id;
  };

  public shared ({ caller }) func updateContact(contact : Contact) : async () {
    requireUser(caller);
    let userContacts = getUserContacts(caller);
    if (not userContacts.contacts.containsKey(contact.id)) {
      Runtime.trap("Contact not found");
    };

    let updatedContact : Contact = {
      contact with
      updatedAt = Time.now();
    };

    userContacts.contacts.add(contact.id, updatedContact);
    updateUserContacts(caller, userContacts);
  };

  public shared ({ caller }) func deleteContact(contactId : Nat) : async () {
    requireUser(caller);
    let userContacts = getUserContacts(caller);
    userContacts.contacts.remove(contactId);
    updateUserContacts(caller, userContacts);
  };

  public query ({ caller }) func getContact(contactId : Nat) : async Contact {
    requireUser(caller);
    let userContacts = getUserContacts(caller);
    switch (userContacts.contacts.get(contactId)) {
      case (?contact) { contact };
      case (null) { Runtime.trap("Contact not found") };
    };
  };

  public query ({ caller }) func listContacts() : async [Contact] {
    requireUser(caller);
    getUserContacts(caller).contacts.values().toArray().sort(Contact.compareByName);
  };

  public shared ({ caller }) func setLockPattern(patternHash : Text) : async () {
    requireUser(caller);
    lockPatterns.add(caller, patternHash);
  };

  public query ({ caller }) func verifyLockPattern(patternHash : Text) : async Bool {
    requireUser(caller);
    switch (lockPatterns.get(caller)) {
      case (?storedHash) { storedHash == patternHash };
      case (null) { false };
    };
  };

  public query ({ caller }) func hasLockPattern() : async Bool {
    requireUser(caller);
    lockPatterns.containsKey(caller);
  };

  func requireUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };
};
