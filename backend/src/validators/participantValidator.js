const { z } = require("zod");

const createParticipantSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
});

const updateParticipantSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
});

module.exports = {
  createParticipantSchema,
  updateParticipantSchema,
};