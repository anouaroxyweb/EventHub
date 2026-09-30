const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  location: z.string().min(2).max(200),
  eventDate: z.string().datetime(),
  maxParticipants: z.number().int().positive(),
});

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  location: z.string().min(2).max(200).optional(),
  eventDate: z.string().datetime().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

const statusSchema = z.object({
  status: z.enum(["draft", "published", "cancelled"]),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  statusSchema,
};