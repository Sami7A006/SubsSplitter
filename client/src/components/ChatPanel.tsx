import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import type { MessageWithUser, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatPanelProps {
  roomId: string;
  messages: MessageWithUser[];
  currentUser: User;
  onSendMessage: (content: string) => void;
  isConnected: boolean;
}

export function ChatPanel({
  roomId,
  messages,
  currentUser,
  onSendMessage,
  isConnected,
}: ChatPanelProps) {
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && isConnected) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

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
    return user.email?.split("@")[0] || "User";
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Room Chat
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-chart-2" : "bg-muted-foreground"
              }`}
            />
            <span className="text-xs font-normal text-muted-foreground">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.userId === currentUser.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                    data-testid={`message-${message.id}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={message.user.profileImageUrl || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(message.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {isOwnMessage ? "You" : getUserDisplayName(message.user)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt!), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              data-testid="input-chat-message"
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!messageInput.trim() || !isConnected}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
