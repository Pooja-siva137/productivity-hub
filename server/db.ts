import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tasks, InsertTask, reminders, InsertReminder, calendarEvents, InsertCalendarEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Task management queries
export async function getUserTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(tasks.createdAt);
}

export async function createTask(userId: number, task: Omit<InsertTask, 'userId'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tasks).values({ ...task, userId });
  return result;
}

export async function updateTask(taskId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(tasks).set(updates).where(eq(tasks.id, taskId));
}

export async function deleteTask(taskId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(tasks).where(eq(tasks.id, taskId));
}

// Reminder queries
export async function getUserReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.userId, userId));
}

export async function createReminder(userId: number, reminder: Omit<InsertReminder, 'userId'>) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(reminders).values({ ...reminder, userId });
}

export async function deleteReminder(reminderId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(reminders).where(eq(reminders.id, reminderId));
}

// Calendar event queries
export async function getUserCalendarEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(calendarEvents.startDate);
}

export async function createCalendarEvent(userId: number, event: Omit<InsertCalendarEvent, 'userId'>) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(calendarEvents).values({ ...event, userId });
}

export async function updateCalendarEvent(eventId: number, updates: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) return null;
  return db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, eventId));
}

export async function deleteCalendarEvent(eventId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
}
