import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransportRequest {
    status: RequestStatus;
    scheduledTime: Time;
    estimatedPrice: bigint;
    dropLocation: string;
    timestamp: Time;
    cropType: string;
    driver?: Principal;
    farmer: Principal;
    quantityKg: bigint;
    pickupLocation: string;
}
export type Time = bigint;
export interface ActivityRecord {
    id: bigint;
    inputData: string;
    action: string;
    isFavorite: boolean;
    outputData: string;
    timestamp: Time;
}
export interface ChatMessage {
    sender: Principal;
    message: string;
    timestamp: Time;
}
export interface UserProfile {
    displayName: string;
    role: UserRole;
}
export enum RequestStatus {
    pending = "pending",
    pickedUp = "pickedUp",
    delivered = "delivered",
    accepted = "accepted"
}
export enum UserRole {
    driver = "driver",
    farmer = "farmer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptRequest(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    clearAllActivities(): Promise<void>;
    createTransportRequest(cropType: string, quantityKg: bigint, pickupLocation: string, dropLocation: string, scheduledTime: Time): Promise<bigint>;
    deleteActivity(id: bigint): Promise<void>;
    deleteRequest(requestId: bigint): Promise<void>;
    getAllRequests(): Promise<Array<TransportRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMessages(requestId: bigint): Promise<Array<ChatMessage>>;
    getMyActivities(): Promise<Array<ActivityRecord>>;
    getMyRequests(): Promise<Array<TransportRequest>>;
    getStats(): Promise<{
        totalDrivers: bigint;
        totalDelivered: bigint;
        totalRequests: bigint;
        totalFarmers: bigint;
    }>;
    getTransportRequest(requestId: bigint): Promise<TransportRequest>;
    getUserCreatedAt(): Promise<Time>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logActivity(action: string, inputData: string, outputData: string): Promise<void>;
    registerUser(displayName: string, role: UserRole): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(requestId: bigint, message: string): Promise<void>;
    switchRole(newRole: UserRole): Promise<void>;
    toggleFavorite(id: bigint): Promise<void>;
    updateDisplayName(displayName: string): Promise<void>;
    updateRequestStatus(requestId: bigint, status: RequestStatus): Promise<void>;
}
