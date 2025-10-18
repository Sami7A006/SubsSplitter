import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertRoomSchema } from "@shared/schema";
import { SiNetflix, SiSpotify, SiAmazon } from "react-icons/si";
import { Users } from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";

const APPS = [
  { name: "Netflix", icon: SiNetflix },
  { name: "Spotify", icon: SiSpotify },
  { name: "Disney+", icon: Users },
  { name: "Amazon Prime", icon: SiAmazon },
  { name: "Others", icon: Users },
];

const formSchema = insertRoomSchema.extend({
  pricePerSeat: z.number().min(0.01, "Price must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateRoom() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedApp, setSelectedApp] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: "",
      totalSeats: 4,
      pricePerSeat: 0,
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        pricePerSeat: Math.round(data.pricePerSeat * 100),
      };
      return await apiRequest("POST", "/api/rooms", payload);
    },
    onSuccess: (room: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Room Created!",
        description: "Your room has been created successfully.",
      });
      setLocation(`/room/${room.id}`);
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
        description: error.message || "Failed to create room",
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

  const onSubmit = (data: FormValues) => {
    createRoomMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a Room</h1>
          <p className="mt-2 text-muted-foreground">
            Set up a new subscription sharing room
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
            <CardDescription>
              Choose an app and set your terms for sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select App</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {APPS.map((app) => {
                            const Icon = app.icon;
                            const isSelected = selectedApp === app.name;
                            return (
                              <button
                                key={app.name}
                                type="button"
                                onClick={() => {
                                  setSelectedApp(app.name);
                                  field.onChange(app.name);
                                }}
                                className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover-elevate active-elevate-2 ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border"
                                }`}
                                data-testid={`button-app-${app.name.toLowerCase().replace(/\+/g, "plus").replace(/ /g, "-")}`}
                              >
                                <Icon className="h-8 w-8" />
                                <span className="text-sm font-medium">{app.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Seats</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-total-seats"
                        />
                      </FormControl>
                      <FormDescription>
                        How many people can share this subscription?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerSeat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Seat ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="9.99"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-price-per-seat"
                        />
                      </FormControl>
                      <FormDescription>
                        How much should each person pay? (for display only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRoomMutation.isPending}
                  data-testid="button-submit-create-room"
                >
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
