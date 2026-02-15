import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("tasks router", () => {
  it("should list tasks for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.create({
      title: "Test Task",
      description: "This is a test task",
      priority: "high",
    });

    expect(result).toBeDefined();
  });

  it("should create task with default priority", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.create({
      title: "Test Task Without Priority",
    });

    expect(result).toBeDefined();
  });

  it("should reject task creation without title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tasks.create({
        title: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should update task status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a task first
    await caller.tasks.create({
      title: "Task to Update",
    });

    // Update the task (assuming ID 1 for testing)
    const result = await caller.tasks.update({
      id: 1,
      status: "in-progress",
    });

    expect(result).toBeDefined();
  });

  it("should delete a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a task first
    await caller.tasks.create({
      title: "Task to Delete",
    });

    // Delete the task
    const result = await caller.tasks.delete({
      id: 1,
    });

    expect(result).toBeDefined();
  });
});

describe("reminders router", () => {
  it("should list reminders for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reminders.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new reminder", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const reminderTime = new Date(Date.now() + 3600000); // 1 hour from now

    const result = await caller.reminders.create({
      taskId: 1,
      reminderTime,
    });

    expect(result).toBeDefined();
  });

  it("should delete a reminder", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reminders.delete({
      id: 1,
    });

    expect(result).toBeDefined();
  });
});

describe("calendar router", () => {
  it("should list calendar events for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calendar.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new calendar event", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();

    const result = await caller.calendar.create({
      title: "Team Meeting",
      description: "Weekly sync",
      startDate,
    });

    expect(result).toBeDefined();
  });

  it("should update a calendar event", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calendar.update({
      id: 1,
      title: "Updated Meeting",
    });

    expect(result).toBeDefined();
  });

  it("should delete a calendar event", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calendar.delete({
      id: 1,
    });

    expect(result).toBeDefined();
  });
});
