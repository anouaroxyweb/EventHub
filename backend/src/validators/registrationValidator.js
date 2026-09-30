const { z } = require("zod");

const createRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  participantId: z.string().uuid(),
});

const updateRegistrationStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

module.exports = {
  createRegistrationSchema,
  updateRegistrationStatusSchema,
};