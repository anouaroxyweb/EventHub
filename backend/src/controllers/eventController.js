const pool = require("../config/db");
const {
  createEventSchema,
  updateEventSchema,
  statusSchema,
} = require("../validators/eventValidator");

// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const validation = createEventSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validation.error.flatten(),
      });
    }

    const {
      title,
      description,
      location,
      eventDate,
      maxParticipants,
    } = validation.data;

    const result = await pool.query(
      `
      INSERT INTO events
      (title, description, location, event_date, max_participants, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        description || null,
        location,
        eventDate,
        maxParticipants,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL EVENTS
const getEvents = async (req, res) => {
  try {
    const { status, date } = req.query;

    let query = `
      SELECT
        e.*,
        u.full_name AS creator_name
      FROM events e
      JOIN users u ON e.created_by = u.id
    `;

    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`e.status = $${values.length}`);
    }

    if (date) {
      values.push(date);
      conditions.push(`DATE(e.event_date) = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY e.event_date ASC`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      events: result.rows,
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET EVENT BY ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        e.*,
        u.full_name AS creator_name
      FROM events e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateEventSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validation.error.flatten(),
      });
    }

    const data = validation.data;

    const existingEvent = await pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [id]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const fields = [];
    const values = [];

    if (data.title !== undefined) {
      values.push(data.title);
      fields.push(`title = $${values.length}`);
    }

    if (data.description !== undefined) {
      values.push(data.description);
      fields.push(`description = $${values.length}`);
    }

    if (data.location !== undefined) {
      values.push(data.location);
      fields.push(`location = $${values.length}`);
    }

    if (data.eventDate !== undefined) {
      values.push(data.eventDate);
      fields.push(`event_date = $${values.length}`);
    }

    if (data.maxParticipants !== undefined) {
      values.push(data.maxParticipants);
      fields.push(`max_participants = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    values.push(id);

    const result = await pool.query(
      `
      UPDATE events
      SET ${fields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *
      `,
      values
    );

    res.json({
      success: true,
      message: "Event updated successfully",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE EVENT STATUS
const updateEventStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const validation = statusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        errors: validation.error.flatten(),
      });
    }

    const { status } = validation.data;

    await client.query("BEGIN");

    const eventResult = await client.query(
      `SELECT * FROM events WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (eventResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = eventResult.rows[0];

    const updatedEvent = await client.query(
      `
      UPDATE events
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    // If event is cancelled,
    // cancel all its registrations
    if (status === "cancelled") {
      await client.query(
        `
        UPDATE registrations
        SET status = 'cancelled'
        WHERE event_id = $1
        `,
        [id]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Event status updated successfully",
      event: updatedEvent.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update event status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
};