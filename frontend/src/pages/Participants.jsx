import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Participants() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const fetchParticipants = async (searchValue = "") => {
    try {
      setLoading(true);

      const url = searchValue
        ? `/participants?search=${encodeURIComponent(searchValue)}`
        : "/participants";

      const response = await api.get(url);

      setParticipants(response.data.participants);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load participants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);

    fetchParticipants(value);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingParticipant(null);

    setForm({
      fullName: "",
      email: "",
      phone: "",
    });

    setShowForm(true);
  };

  const openEditForm = (participant) => {
    setEditingParticipant(participant);

    setForm({
      fullName: participant.full_name,
      email: participant.email,
      phone: participant.phone || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingParticipant) {
        await api.put(
          `/participants/${editingParticipant.id}`,
          form
        );
      } else {
        await api.post("/participants", form);
      }

      setShowForm(false);

      setEditingParticipant(null);

      setForm({
        fullName: "",
        email: "",
        phone: "",
      });

      fetchParticipants(search);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save participant"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

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
            className="nav-item"
            onClick={() => navigate("/events")}
          >
            <span>◫</span>
            Events
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/participants")}
          >
            <span>♙</span>
            Participants
          </button>

          <button className="nav-item">
            <span>✓</span>
            Registrations
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">
              {user?.full_name?.charAt(0)}
            </div>

            <div>
              <strong>{user?.full_name}</strong>
              <small>{user?.role}</small>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Participants</h1>

            <p>
              Manage event participants
            </p>
          </div>

          <button
            className="create-event-btn"
            onClick={openCreateForm}
          >
            + Add Participant
          </button>

        </header>

        {/* SEARCH */}

        <div className="participants-toolbar">

          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          <span className="participants-count">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </span>

        </div>

        {/* ERROR */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="content-card">

          {loading ? (

            <div className="loading-screen">
              <div className="spinner"></div>
              <p>Loading participants...</p>
            </div>

          ) : participants.length === 0 ? (

            <div className="empty-state">
              <div>♙</div>

              <h3>No participants found</h3>

              <p>
                Add a participant to get started.
              </p>
            </div>

          ) : (

            <div className="table-wrapper">

              <table className="events-table">

                <thead>
                  <tr>
                    <th>PARTICIPANT</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>CREATED</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {participants.map(
                    (participant) => (

                      <tr key={participant.id}>

                        <td>

                          <div className="event-name">

                            <div className="event-avatar">
                              {participant.full_name.charAt(
                                0
                              )}
                            </div>

                            <strong>
                              {participant.full_name}
                            </strong>

                          </div>

                        </td>

                        <td>
                          {participant.email}
                        </td>

                        <td>
                          {participant.phone || "-"}
                        </td>

                        <td>
                          {new Date(
                            participant.created_at
                          ).toLocaleDateString()}
                        </td>

                        <td>

                          <button
                            className="edit-btn"
                            onClick={() =>
                              openEditForm(participant)
                            }
                          >
                            Edit
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* MODAL */}

      {showForm && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingParticipant
                    ? "Edit Participant"
                    : "Add Participant"}
                </h2>

                <p>
                  {editingParticipant
                    ? "Update participant information"
                    : "Add a new participant"}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-field">

                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ahmed Benali"
                  required
                />

              </div>

              <div className="form-field">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ahmed@example.com"
                  required
                />

              </div>

              <div className="form-field">

                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0612345678"
                />

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-event-btn"
                >
                  {editingParticipant
                    ? "Save Changes"
                    : "Add Participant"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Participants;