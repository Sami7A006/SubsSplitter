import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Users, DollarSign } from "lucide-react";
import { SiNetflix, SiSpotify, SiAmazon } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { RoomWithCreator } from "@shared/schema";

interface RoomCardProps {
  room: RoomWithCreator;
  showRequestButton?: boolean;
  onRequestJoin?: (roomId: string) => void;
}

const APP_ICONS: Record<string, any> = {
  Netflix: SiNetflix,
  Spotify: SiSpotify,
  "Amazon Prime": SiAmazon,
};

export function RoomCard({ room, showRequestButton = true, onRequestJoin }: RoomCardProps) {
  const { toast } = useToast();
  const availableSeats = room.totalSeats - room.occupiedSeats;
  const occupancyPercentage = (room.occupiedSeats / room.totalSeats) * 100;
  
  const AppIcon = APP_ICONS[room.appName];

  const getStatusBadge = () => {
    if (availableSeats === 0) {
      return (
        <Badge variant="destructive" className="text-xs" data-testid={`badge-status-${room.id}`}>
          Full
        </Badge>
      );
    }
    if (availableSeats <= 2) {
      return (
        <Badge className="text-xs bg-chart-3 text-white" data-testid={`badge-status-${room.id}`}>
          Limited
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-chart-2 text-white" data-testid={`badge-status-${room.id}`}>
        Available
      </Badge>
    );
  };

  const copyRoomId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(room.id);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard",
    });
  };

  const handleRequestJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRequestJoin) {
      onRequestJoin(room.id);
    }
  };

  return (
    <Link href={`/room/${room.id}`}>
      <Card 
        className="hover-elevate active-elevate-2 cursor-pointer transition-all h-full flex flex-col"
        data-testid={`card-room-${room.id}`}
      >
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {AppIcon ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <AppIcon className="h-7 w-7" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold leading-tight" data-testid={`text-app-${room.id}`}>
                  {room.appName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  by {room.creator.firstName || room.creator.email?.split("@")[0] || "User"}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium" data-testid={`text-seats-${room.id}`}>
                {room.occupiedSeats} / {room.totalSeats}
              </span>
            </div>
            <Progress value={occupancyPercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3 pb-4">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span data-testid={`text-price-${room.id}`}>
              {(room.pricePerSeat / 100).toFixed(2)}
            </span>
            <span className="text-sm font-normal text-muted-foreground">/ seat</span>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-1.5 font-mono text-xs" data-testid={`text-room-id-${room.id}`}>
              {room.id.slice(0, 8)}...
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyRoomId}
              className="h-8 w-8"
              data-testid={`button-copy-${room.id}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>

        {showRequestButton && availableSeats > 0 && (
          <CardFooter className="pt-0">
            <Button
              className="w-full"
              onClick={handleRequestJoin}
              data-testid={`button-request-join-${room.id}`}
            >
              Request to Join
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
