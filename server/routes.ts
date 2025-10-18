// Referenced from javascript_log_in_with_replit and javascript_websocket blueprints
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRoomSchema, insertJoinRequestSchema, insertMessageSchema } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  userId?: string;
  roomId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Room routes
  app.get("/api/rooms", isAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/:id", isAuthenticated, async (req, res) => {
    try {
      const room = await storage.getRoomById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.post("/api/rooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertRoomSchema.parse(req.body);
      
      const room = await storage.createRoom({
        ...validatedData,
        creatorId: userId,
      });
      
      res.status(201).json(room);
    } catch (error: any) {
      console.error("Error creating room:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid room data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  // Join request routes
  app.get("/api/rooms/:id/requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getJoinRequestsByRoom(req.params.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching join requests:", error);
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  app.post("/api/join-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertJoinRequestSchema.parse(req.body);
      
      const request = await storage.createJoinRequest({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating join request:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create join request" });
    }
  });

  app.patch("/api/join-requests/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.body;

      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Get the specific request by ID
      const request = await storage.getJoinRequestById(req.params.id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Verify the user is the room creator
      const room = await storage.getRoomById(request.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (room.creatorId !== userId) {
        return res.status(403).json({ message: "Only room creator can update requests" });
      }

      // Prevent oversubscription - check if room is full before accepting
      if (status === "accepted" && room.occupiedSeats >= room.totalSeats) {
        return res.status(400).json({ message: "Room is already full" });
      }

      // Update the request status
      const updatedRequest = await storage.updateJoinRequestStatus(req.params.id, status);

      // If accepted, increment the occupied seats
      if (status === "accepted") {
        await storage.incrementRoomSeats(room.id);
      }

      res.json(updatedRequest);
    } catch (error: any) {
      console.error("Error updating join request:", error);
      res.status(500).json({ message: "Failed to update join request" });
    }
  });

  // Message routes
  app.get("/api/rooms/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getMessagesByRoom(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join') {
          ws.userId = message.userId;
          ws.roomId = message.roomId;
          console.log(`User ${message.userId} joined room ${message.roomId}`);
        } else if (message.type === 'sendMessage') {
          const validatedData = insertMessageSchema.parse({
            roomId: message.roomId,
            content: message.content,
          });

          const savedMessage = await storage.createMessage({
            ...validatedData,
            userId: message.userId,
          });

          // Broadcast to all clients in the same room
          wss.clients.forEach((client: WebSocket) => {
            const wsClient = client as WebSocketClient;
            if (
              wsClient.readyState === WebSocket.OPEN &&
              wsClient.roomId === message.roomId
            ) {
              wsClient.send(
                JSON.stringify({
                  type: 'message',
                  roomId: message.roomId,
                  message: savedMessage,
                })
              );
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
