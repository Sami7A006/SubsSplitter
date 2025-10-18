import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { RoomCard } from "@/components/RoomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RoomWithCreator } from "@shared/schema";
import { Users, Inbox } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: rooms, isLoading: roomsLoading } = useQuery<RoomWithCreator[]>({
    queryKey: ["/api/rooms"],
    enabled: !!user,
  });

  const requestJoinMutation = useMutation({
    mutationFn: async (roomId: string) => {
      await apiRequest("POST", "/api/join-requests", { roomId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Request Sent!",
        description: "The room creator will be notified of your request.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to send join request",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Rooms</h1>
          <p className="mt-2 text-muted-foreground">
            Find a room to join or create your own
          </p>
        </div>

        {roomsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="container-rooms-grid">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onRequestJoin={(roomId) => requestJoinMutation.mutate(roomId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-6">
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No rooms yet</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Be the first to create a room and start saving on subscriptions!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
