import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";

module {
  type UserRole = { #farmer; #driver };
  type RequestStatus = { #pending; #accepted; #pickedUp; #delivered };
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
  type ActivityRecord = {
    id : Nat;
    action : Text;
    inputData : Text;
    outputData : Text;
    timestamp : Time.Time;
    isFavorite : Bool;
  };

  type UserProfile = { displayName : Text; role : UserRole };

  type OldActor = {
    accessControlState : {
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, AccessControl.UserRole>;
    };
    nextRequestId : Nat;
    transportRequests : Map.Map<Nat, TransportRequest>;
    chatMessages : Map.Map<Nat, List.List<ChatMessage>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    accessControlState : {
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, AccessControl.UserRole>;
    };
    nextRequestId : Nat;
    nextActivityId : Nat;
    transportRequests : Map.Map<Nat, TransportRequest>;
    chatMessages : Map.Map<Nat, List.List<ChatMessage>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userActivities : Map.Map<Principal, Map.Map<Nat, ActivityRecord>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      nextRequestId = old.nextRequestId;
      nextActivityId = 1;
      transportRequests = old.transportRequests;
      chatMessages = old.chatMessages;
      userProfiles = old.userProfiles;
      userActivities = Map.empty<Principal, Map.Map<Nat, ActivityRecord>>();
    };
  };
};
