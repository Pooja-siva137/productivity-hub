import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createTask, deleteTask, getUserTasks, updateTask, createReminder, deleteReminder, getUserReminders, createCalendarEvent, deleteCalendarEvent, getUserCalendarEvents, updateCalendarEvent } from "./db";
import { transcribeAudio } from "./_core/voiceTranscription";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tasks: router({
    list: protectedProcedure.query(({ ctx }) => getUserTasks(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }))
      .mutation(({ ctx, input }) =>
        createTask(ctx.user.id, {
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority || "medium",
          status: "pending",
        })
      ),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "in-progress", "completed"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }))
      .mutation(({ input }) =>
        updateTask(input.id, {
          status: input.status,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTask(input.id)),
  }),

  reminders: router({
    list: protectedProcedure.query(({ ctx }) => getUserReminders(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        reminderTime: z.date(),
      }))
      .mutation(({ ctx, input }) =>
        createReminder(ctx.user.id, {
          taskId: input.taskId,
          reminderTime: input.reminderTime,
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteReminder(input.id)),
  }),

  calendar: router({
    list: protectedProcedure.query(({ ctx }) => getUserCalendarEvents(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        taskId: z.number().optional(),
        color: z.string().optional(),
      }))
      .mutation(({ ctx, input }) =>
        createCalendarEvent(ctx.user.id, {
          title: input.title,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          taskId: input.taskId,
          color: input.color || "#3b82f6",
        })
      ),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        color: z.string().optional(),
      }))
      .mutation(({ input }) =>
        updateCalendarEvent(input.id, {
          title: input.title,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          color: input.color,
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCalendarEvent(input.id)),
  }),

  voice: router({
    transcribe: protectedProcedure
      .input(z.object({
        audioUrl: z.string().url(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language,
        });
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
