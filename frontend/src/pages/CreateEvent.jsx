import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    maxParticipants: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/events", {
        title: form.title,
        description: form.description,
        location: form.location,
        eventDate: new Date(form.eventDate).toISOString(),
        maxParticipants: Number(form.maxParticipants),
      });

      navigate("/events");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">E</div>
          <span>EventHub</span>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item"
            onClick={() => navigate("/dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/events")}
          >
            <span>◫</span>
            Events
          </button>

          <button className="nav-item">
            <span>♙</span>
            Participants
          </button>

          <button className="nav-item">
            <span>✓</span>
            Registrations
          </button>

        </nav>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Create Event</h1>
            <p>
              Create a new event for your participants
            </p>
          </div>

        </header>

        <div className="form-card">

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-field full">
                <label>Event Title</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. React Workshop"
                  required
                />
              </div>

              <div className="form-field full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows="4"
                />
              </div>

              <div className="form-field">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Casablanca"
                  required
                />
              </div>

              <div className="form-field">
                <label>Maximum Participants</label>

                <input
                  type="number"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  placeholder="100"
                  required
                />
              </div>

              <div className="form-field full">
                <label>Event Date & Time</label>

                <input
                  type="datetime-local"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/events")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-event-btn"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Event"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default CreateEvent;