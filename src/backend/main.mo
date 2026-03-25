import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserRole = { #farmer; #driver };
  type RequestStatus = { #pending; #accepted; #pickedUp; #delivered };

  type UserProfile = { displayName : Text; role : UserRole };

  type TransportRequest = {
    cropType : Text;
    quantityKg : Nat;
    pickupLocation : Text;
    dropLocation : Text;
    scheduledTime : Time.Time;
    status : RequestStatus;
    estimatedPrice : Nat;
    farmer : Principal;
    driver : ?Principal;
    timestamp : Time.Time;
  };

  type ChatMessage = { sender : Principal; message : Text; timestamp : Time.Time };

  module TransportRequest {
    public func compareByTimestamp(r1 : TransportRequest, r2 : TransportRequest) : Order.Order {
      Int.compare(r2.timestamp, r1.timestamp);
    };
  };

  module ChatMessage {
    public func compareByTimestamp(m1 : ChatMessage, m2 : ChatMessage) : Order.Order {
      Int.compare(m1.timestamp, m2.timestamp);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextRequestId = 1;
  let transportRequests = Map.empty<Nat, TransportRequest>();
  let chatMessages = Map.empty<Nat, List.List<ChatMessage>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func isRegisteredUser(caller : Principal) : Bool {
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) { role == #user or role == #admin };
      case (null) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerUser(displayName : Text, role : UserRole) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous users cannot register") };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already registered") };
    if (not isRegisteredUser(caller)) {
      accessControlState.userRoles.add(caller, #user);
    };
    userProfiles.add(caller, { displayName; role });
  };

  public shared ({ caller }) func createTransportRequest(cropType : Text, quantityKg : Nat, pickupLocation : Text, dropLocation : Text, scheduledTime : Time.Time) : async Nat {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#farmer) {
            let requestId = nextRequestId;
            nextRequestId += 1;
            transportRequests.add(requestId, {
              cropType; quantityKg; pickupLocation; dropLocation; scheduledTime;
              status = #pending;
              estimatedPrice = calculatePrice(quantityKg);
              farmer = caller; driver = null;
              timestamp = Time.now();
            });
            requestId;
          };
          case (#driver) { Runtime.trap("Only farmers can create requests") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func deleteRequest(requestId : Nat) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (transportRequests.get(requestId)) {
      case (?request) {
        if (caller != request.farmer) { Runtime.trap("Only the farmer who created this request can delete it") };
        switch (request.status) {
          case (#pending) {
            transportRequests.remove(requestId);
          };
          case (_) { Runtime.trap("Only pending requests can be deleted") };
        };
      };
      case (null) { Runtime.trap("Request not found") };
    };
  };

  public shared ({ caller }) func acceptRequest(requestId : Nat) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#driver) {
            switch (transportRequests.get(requestId)) {
              case (?request) {
                switch (request.status) {
                  case (#pending) {
                    transportRequests.add(requestId, { request with status = #accepted; driver = ?caller });
                  };
                  case (_) { Runtime.trap("Request is not pending") };
                };
              };
              case (null) { Runtime.trap("Request not found") };
            };
          };
          case (#farmer) { Runtime.trap("Only drivers can accept requests") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func updateRequestStatus(requestId : Nat, status : RequestStatus) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (transportRequests.get(requestId)) {
      case (?request) {
        if (caller != request.farmer and (not isRequestDriver(caller, request))) {
          Runtime.trap("Unauthorized: Only farmer or driver can update status");
        };
        transportRequests.add(requestId, { request with status });
      };
      case (null) { Runtime.trap("Request not found") };
    };
  };

  public shared ({ caller }) func sendMessage(requestId : Nat, message : Text) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (_) {
        switch (transportRequests.get(requestId)) {
          case (?request) {
            if (caller != request.farmer and (not isRequestDriver(caller, request))) {
              Runtime.trap("Unauthorized");
            };
            let chatList = switch (chatMessages.get(requestId)) {
              case (?msgs) { msgs };
              case (null) { List.empty<ChatMessage>() };
            };
            chatList.add({ sender = caller; message; timestamp = Time.now() });
            chatMessages.add(requestId, chatList);
          };
          case (null) { Runtime.trap("Request not found") };
        };
      };
    };
  };

  public query ({ caller }) func getTransportRequest(requestId : Nat) : async TransportRequest {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (transportRequests.get(requestId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Request not found") };
    };
  };

  public query ({ caller }) func getAllRequests() : async [TransportRequest] {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    transportRequests.values().toArray().sort(TransportRequest.compareByTimestamp);
  };

  public query ({ caller }) func getMessages(requestId : Nat) : async [ChatMessage] {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (transportRequests.get(requestId)) {
      case (?request) {
        if (caller != request.farmer and (not isRequestDriver(caller, request))) {
          Runtime.trap("Unauthorized");
        };
      };
      case (null) { Runtime.trap("Request not found") };
    };
    switch (chatMessages.get(requestId)) {
      case (?msgs) { msgs.toArray().sort(ChatMessage.compareByTimestamp) };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getMyRequests() : async [TransportRequest] {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    if (userProfiles.get(caller) == null) { Runtime.trap("User not found") };
    transportRequests.values().toArray().filter(func(req) { req.farmer == caller or isRequestDriver(caller, req) });
  };

  public query func getStats() : async { totalRequests : Nat; totalDelivered : Nat; totalFarmers : Nat; totalDrivers : Nat } {
    let allRequests = transportRequests.values().toArray();
    let allProfiles = userProfiles.values().toArray();
    {
      totalRequests = allRequests.size();
      totalDelivered = allRequests.filter(func(req) { req.status == #delivered }).size();
      totalFarmers = allProfiles.filter(func(p) { p.role == #farmer }).size();
      totalDrivers = allProfiles.filter(func(p) { p.role == #driver }).size();
    };
  };

  public shared ({ caller }) func updateDisplayName(displayName : Text) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (userProfiles.get(caller)) {
      case (?profile) { userProfiles.add(caller, { profile with displayName }) };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func switchRole(newRole : UserRole) : async () {
    if (not isRegisteredUser(caller)) { Runtime.trap("Unauthorized") };
    switch (userProfiles.get(caller)) {
      case (?profile) { userProfiles.add(caller, { profile with role = newRole }) };
      case (null) { Runtime.trap("User not found") };
    };
  };

  func isRequestDriver(caller : Principal, request : TransportRequest) : Bool {
    switch (request.driver) {
      case (?driver) { caller == driver };
      case (null) { false };
    };
  };

  func calculatePrice(quantityKg : Nat) : Nat { quantityKg * 10 };
};
