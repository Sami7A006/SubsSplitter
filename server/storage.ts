// Referenced from javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  rooms,
  joinRequests,
  messages,
  type User,
  type UpsertUser,
  type Room,
  type InsertRoom,
  type JoinRequest,
  type InsertJoinRequest,
  type Message,
  type InsertMessage,
  type RoomWithCreator,
  type JoinRequestWithUser,
  type MessageWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Room operations
  createRoom(room: InsertRoom & { creatorId: string }): Promise<Room>;
  getRooms(): Promise<RoomWithCreator[]>;
  getRoomById(id: string): Promise<RoomWithCreator | undefined>;

  // Join request operations
  createJoinRequest(request: InsertJoinRequest & { userId: string }): Promise<JoinRequest>;
  getJoinRequestsByRoom(roomId: string): Promise<JoinRequestWithUser[]>;
  getJoinRequestById(requestId: string): Promise<JoinRequestWithUser | undefined>;
  updateJoinRequestStatus(requestId: string, status: string): Promise<JoinRequest>;
  incrementRoomSeats(roomId: string): Promise<void>;

  // Message operations
  createMessage(message: InsertMessage & { userId: string }): Promise<MessageWithUser>;
  getMessagesByRoom(roomId: string): Promise<MessageWithUser[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Room operations
  async createRoom(roomData: InsertRoom & { creatorId: string }): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values(roomData)
      .returning();
    return room;
  }

  async getRooms(): Promise<RoomWithCreator[]> {
    const result = await db
      .select()
      .from(rooms)
      .leftJoin(users, eq(rooms.creatorId, users.id))
      .orderBy(desc(rooms.createdAt));

    return result.map((row) => ({
      ...row.rooms,
      creator: row.users!,
    }));
  }

  async getRoomById(id: string): Promise<RoomWithCreator | undefined> {
    const result = await db
      .select()
      .from(rooms)
      .leftJoin(users, eq(rooms.creatorId, users.id))
      .where(eq(rooms.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].rooms,
      creator: result[0].users!,
    };
  }

  // Join request operations
  async createJoinRequest(
    requestData: InsertJoinRequest & { userId: string }
  ): Promise<JoinRequest> {
    const [request] = await db
      .insert(joinRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async getJoinRequestsByRoom(roomId: string): Promise<JoinRequestWithUser[]> {
    const result = await db
      .select()
      .from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .where(eq(joinRequests.roomId, roomId))
      .orderBy(desc(joinRequests.createdAt));

    return result.map((row) => ({
      ...row.join_requests,
      user: row.users!,
    }));
  }

  async getJoinRequestById(requestId: string): Promise<JoinRequestWithUser | undefined> {
    const result = await db
      .select()
      .from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .where(eq(joinRequests.id, requestId))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].join_requests,
      user: result[0].users!,
    };
  }

  // Message operations
  async createMessage(
    messageData: InsertMessage & { userId: string }
  ): Promise<MessageWithUser> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();

    const user = await this.getUser(message.userId);

    return {
      ...message,
      user: user!,
    };
  }

  async getMessagesByRoom(roomId: string): Promise<MessageWithUser[]> {
    const result = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.roomId, roomId))
      .orderBy(messages.createdAt);

    return result.map((row) => ({
      ...row.messages,
      user: row.users!,
    }));
  }

  async updateJoinRequestStatus(requestId: string, status: string): Promise<JoinRequest> {
    const [request] = await db
      .update(joinRequests)
      .set({ status: status as any })
      .where(eq(joinRequests.id, requestId))
      .returning();
    return request;
  }

  async incrementRoomSeats(roomId: string): Promise<void> {
    // Get current room to read occupiedSeats
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (!room) {
      throw new Error("Room not found");
    }

    // Update with incremented value
    await db
      .update(rooms)
      .set({ occupiedSeats: room.occupiedSeats + 1 })
      .where(eq(rooms.id, roomId));
  }
}

export const storage = new DatabaseStorage();
