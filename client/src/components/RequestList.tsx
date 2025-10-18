import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Inbox, Check, X } from "lucide-react";
import type { JoinRequestWithUser, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RequestListProps {
  requests: JoinRequestWithUser[];
  isCreator: boolean;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  isProcessing?: boolean;
}

export function RequestList({ requests, isCreator, onAccept, onDecline, isProcessing }: RequestListProps) {
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(" ");
    }
    return user.email || "User";
  };

  if (!isCreator) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Join Requests
          {requests.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              No join requests yet
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 hover-elevate"
                data-testid={`request-${request.id}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={request.user.profileImageUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback>{getUserInitials(request.user)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium" data-testid={`text-requester-${request.id}`}>
                    {getUserDisplayName(request.user)}
                  </p>
                  {request.user.email && (
                    <p className="text-sm text-muted-foreground">
                      {request.user.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(request.createdAt!), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {request.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="default"
                      className="h-8 w-8 bg-chart-2 hover:bg-chart-2/90"
                      onClick={() => onAccept?.(request.id)}
                      disabled={isProcessing}
                      data-testid={`button-accept-${request.id}`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => onDecline?.(request.id)}
                      disabled={isProcessing}
                      data-testid={`button-decline-${request.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant={request.status === "accepted" ? "default" : "secondary"}>
                    {request.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
