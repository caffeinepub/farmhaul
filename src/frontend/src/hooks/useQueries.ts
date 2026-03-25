import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChatMessage,
  RequestStatus,
  TransportRequest,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<TransportRequest & { id: bigint }>>({
    queryKey: ["allRequests"],
    queryFn: async () => {
      if (!actor) return [];
      const requests = await actor.getAllRequests();
      return requests.map((r, i) => ({ ...r, id: BigInt(i) }));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetMyRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<TransportRequest & { id: bigint }>>({
    queryKey: ["myRequests"],
    queryFn: async () => {
      if (!actor) return [];
      const requests = await actor.getMyRequests();
      return requests.map((r, i) => ({ ...r, id: BigInt(i) }));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetTransportRequest(requestId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<TransportRequest>({
    queryKey: ["request", requestId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getTransportRequest(requestId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useGetMessages(requestId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<ChatMessage>>({
    queryKey: ["messages", requestId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages(requestId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useAcceptRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.acceptRequest(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allRequests"] });
      qc.invalidateQueries({ queryKey: ["myRequests"] });
    },
  });
}

export function useUpdateRequestStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: { requestId: bigint; status: RequestStatus }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateRequestStatus(requestId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allRequests"] });
      qc.invalidateQueries({ queryKey: ["myRequests"] });
      qc.invalidateQueries({ queryKey: ["request"] });
    },
  });
}

export function useCreateTransportRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      cropType: string;
      quantityKg: bigint;
      pickupLocation: string;
      dropLocation: string;
      scheduledTime: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTransportRequest(
        data.cropType,
        data.quantityKg,
        data.pickupLocation,
        data.dropLocation,
        data.scheduledTime,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myRequests"] });
      qc.invalidateQueries({ queryKey: ["allRequests"] });
    },
  });
}

export function useDeleteRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("No actor");
      // Cast to access deleteRequest which is defined in backend.d.ts
      await (
        actor as unknown as { deleteRequest(id: bigint): Promise<void> }
      ).deleteRequest(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myRequests"] });
      qc.invalidateQueries({ queryKey: ["allRequests"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      message,
    }: { requestId: bigint; message: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.sendMessage(requestId, message);
    },
    onSuccess: (_data, { requestId }) => {
      qc.invalidateQueries({ queryKey: ["messages", requestId.toString()] });
    },
  });
}
