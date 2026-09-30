const pool = require("../config/db");

const {
  createRegistrationSchema,
  updateRegistrationStatusSchema,
} = require("../validators/registrationValidator");

// CREATE REGISTRATION
const createRegistration = async (req, res) => {
  const client = await pool.connect();

  try {
    const validation = createRegistrationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validation.error.flatten(),
      });
    }

    const { eventId, participantId } = validation.data;

    await client.query("BEGIN");

    // 1. Check event
    const eventResult = await client.query(
      `
      SELECT *
      FROM events
      WHERE id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = eventResult.rows[0];

    // 2. Event must be published
    if (event.status !== "published") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Cannot register for an event that is not published",
      });
    }

    // 3. Check participant
    const participantResult = await client.query(
      `
      SELECT *
      FROM participants
      WHERE id = $1
      `,
      [participantId]
    );

    if (participantResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    // 4. Check duplicate registration
    const duplicateResult = await client.query(
      `
      SELECT *
      FROM registrations
      WHERE event_id = $1
      AND participant_id = $2
      `,
      [eventId, participantId]
    );

    if (duplicateResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Participant is already registered for this event",
      });
    }

    // 5. Check capacity
    const countResult = await client.query(
      `
      SELECT COUNT(*)::int AS count
      FROM registrations
      WHERE event_id = $1
      AND status IN ('pending', 'confirmed')
      `,
      [eventId]
    );

    const currentRegistrations = countResult.rows[0].count;

    if (currentRegistrations >= event.max_participants) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Event has reached maximum capacity",
      });
    }

    // 6. Create registration
    const registrationResult = await client.query(
      `
      INSERT INTO registrations
      (event_id, participant_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [eventId, participantId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Registration created successfully",
      registration: registrationResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    client.release();
  }
};

// GET REGISTRATIONS
const getRegistrations = async (req, res) => {
  try {
    const { eventId, status } = req.query;

    let query = `
      SELECT
        r.id,
        r.event_id,
        r.participant_id,
        r.status,
        r.created_at,

        e.title AS event_title,
        e.event_date,

        p.full_name AS participant_name,
        p.email AS participant_email,
        p.phone AS participant_phone

      FROM registrations r

      JOIN events e
        ON r.event_id = e.id

      JOIN participants p
        ON r.participant_id = p.id
    `;

    const conditions = [];
    const values = [];

    if (eventId) {
      values.push(eventId);
      conditions.push(`r.event_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      conditions.push(`r.status = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      registrations: result.rows,
    });
  } catch (error) {
    console.error("Get registrations error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE REGISTRATION STATUS
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const validation =
      updateRegistrationStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        errors: validation.error.flatten(),
      });
    }

    const { status } = validation.data;

    const existing = await pool.query(
      `
      SELECT *
      FROM registrations
      WHERE id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const result = await pool.query(
      `
      UPDATE registrations
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    res.json({
      success: true,
      message: "Registration status updated successfully",
      registration: result.rows[0],
    });
  } catch (error) {
    console.error("Update registration status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
};