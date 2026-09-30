const pool = require("../config/db");

const {
  createParticipantSchema,
  updateParticipantSchema,
} = require("../validators/participantValidator");

// CREATE
const createParticipant = async (req, res) => {
  try {
    const validation = createParticipantSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validation.error.flatten(),
      });
    }

    const { fullName, email, phone } = validation.data;

    const existing = await pool.query(
      "SELECT id FROM participants WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Participant email already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO participants (full_name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [fullName, email, phone || null]
    );

    res.status(201).json({
      success: true,
      message: "Participant created successfully",
      participant: result.rows[0],
    });
  } catch (error) {
    console.error("Create participant error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL + SEARCH
const getParticipants = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT *
      FROM participants
    `;

    const values = [];

    if (search) {
      values.push(`%${search}%`);

      query += `
        WHERE full_name ILIKE $1
        OR email ILIKE $1
        OR phone ILIKE $1
      `;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      participants: result.rows,
    });
  } catch (error) {
    console.error("Get participants error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE
const updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateParticipantSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validation.error.flatten(),
      });
    }

    const existing = await pool.query(
      "SELECT * FROM participants WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const data = validation.data;

    if (data.email !== undefined) {
      const emailExists = await pool.query(
        "SELECT id FROM participants WHERE email = $1 AND id != $2",
        [data.email, id]
      );

      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Participant email already exists",
        });
      }
    }

    const fields = [];
    const values = [];

    if (data.fullName !== undefined) {
      values.push(data.fullName);
      fields.push(`full_name = $${values.length}`);
    }

    if (data.email !== undefined) {
      values.push(data.email);
      fields.push(`email = $${values.length}`);
    }

    if (data.phone !== undefined) {
      values.push(data.phone);
      fields.push(`phone = $${values.length}`);
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
      UPDATE participants
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING *
      `,
      values
    );

    res.json({
      success: true,
      message: "Participant updated successfully",
      participant: result.rows[0],
    });
  } catch (error) {
    console.error("Update participant error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createParticipant,
  getParticipants,
  updateParticipant,
};