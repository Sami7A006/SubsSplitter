import { useEffect, useState, useCallback } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { ChatPanel } from "@/components/ChatPanel";
import { RequestList } from "@/components/RequestList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type {
  RoomWithCreator,
  JoinRequestWithUser,
  MessageWithUser,
} from "@shared/schema";
import { SiNetflix, SiSpotify, SiAmazon } from "react-icons/si";
import { Users, DollarSign, Copy, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const APP_ICONS: Record<string, any> = {
  Netflix: SiNetflix,
  Spotify: SiSpotify,
  "Amazon Prime": SiAmazon,
};

export default function RoomDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/room/:id");
  const { toast } = useToast();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);

  const roomId = params?.id;

  const { data: room, isLoading: roomLoading } = useQuery<RoomWithCreator>({
    queryKey: ["/api/rooms", roomId],
    enabled: !!user && !!roomId,
  });

  const { data: requests = [] } = useQuery<JoinRequestWithUser[]>({
    queryKey: ["/api/rooms", roomId, "requests"],
    enabled: !!user && !!roomId && room?.creatorId === user?.id,
  });

  const { data: initialMessages = [] } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/rooms", roomId, "messages"],
    enabled: !!user && !!roomId,
  });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const requestJoinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/join-requests", { roomId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
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

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      await apiRequest("PATCH", `/api/join-requests/${requestId}`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId, "requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
      toast({
        title: status === "accepted" ? "Request Accepted" : "Request Declined",
        description:
          status === "accepted"
            ? "The user has been added to your room."
            : "The request has been declined.",
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
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user || !roomId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "join", roomId, userId: user.id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" && data.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "joinRequest" && data.roomId === roomId) {
        queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId, "requests"] });
        if (room?.creatorId === user.id) {
          toast({
            title: "New Join Request",
            description: `${data.requesterName} wants to join your room`,
          });
        }
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [user, roomId, room?.creatorId, toast]);

  const sendMessage = useCallback(
    (content: string) => {
      if (ws && isConnected && user && roomId) {
        ws.send(
          JSON.stringify({
            type: "sendMessage",
            roomId,
            userId: user.id,
            content,
          })
        );
      }
    },
    [ws, isConnected, user, roomId]
  );

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

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Room not found</h1>
            <Link href="/">
              <Button className="mt-4">Go Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const AppIcon = APP_ICONS[room.appName];
  const availableSeats = room.totalSeats - room.occupiedSeats;
  const occupancyPercentage = (room.occupiedSeats / room.totalSeats) * 100;
  const isCreator = room.creatorId === user.id;

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {AppIcon ? (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                        <AppIcon className="h-10 w-10" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl" data-testid="text-room-app">
                        {room.appName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created by{" "}
                        {isCreator
                          ? "you"
                          : room.creator.firstName ||
                            room.creator.email?.split("@")[0] ||
                            "User"}
                      </p>
                    </div>
                  </div>
                  {availableSeats === 0 ? (
                    <Badge variant="destructive">Full</Badge>
                  ) : availableSeats <= 2 ? (
                    <Badge className="bg-chart-3 text-white">Limited</Badge>
                  ) : (
                    <Badge className="bg-chart-2 text-white">Available</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Seats Available
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" data-testid="text-room-seats">
                          {room.occupiedSeats} / {room.totalSeats}
                        </span>
                      </div>
                      <Progress value={occupancyPercentage} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Price Per Seat
                    </div>
                    <div className="mt-2 text-3xl font-bold" data-testid="text-room-price">
                      ${(room.pricePerSeat / 100).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Room ID</label>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-4 py-2 font-mono text-sm" data-testid="text-room-id-full">
                      {room.id}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyRoomId}
                      data-testid="button-copy-room-id"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {!isCreator && availableSeats > 0 && (
                  <Button
                    className="w-full"
                    onClick={() => requestJoinMutation.mutate()}
                    disabled={requestJoinMutation.isPending}
                    data-testid="button-request-join"
                  >
                    {requestJoinMutation.isPending ? "Sending..." : "Request to Join"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="h-[500px]">
              <ChatPanel
                roomId={room.id}
                messages={messages}
                currentUser={user}
                onSendMessage={sendMessage}
                isConnected={isConnected}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <RequestList
              requests={requests}
              isCreator={isCreator}
              onAccept={(requestId) =>
                updateRequestMutation.mutate({ requestId, status: "accepted" })
              }
              onDecline={(requestId) =>
                updateRequestMutation.mutate({ requestId, status: "declined" })
              }
              isProcessing={updateRequestMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
