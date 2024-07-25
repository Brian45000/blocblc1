import { useState, useEffect } from "react";
import "./HomePage.css";
import Header from "./Header";

const baseURI = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    email: "",
    id_role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(baseURI + "api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError("Erreur lors de la récupération des utilisateurs");
        }
      } catch (error) {
        setError("Erreur réseau");
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await fetch(baseURI + "api/roles", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          setError("Erreur lors de la récupération des rôles");
        }
      } catch (error) {
        setError("Erreur réseau");
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  const handleEditChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(baseURI + `api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowEditModal(false);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? { ...user, ...formData } : user
          )
        );
        alert("Utilisateur modifié avec succès");
      } else {
        alert("Erreur lors de la modification de l'utilisateur");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(baseURI + `api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== selectedUser.id)
        );
        alert("Utilisateur supprimé avec succès");
      } else {
        alert("Erreur lors de la suppression de l'utilisateur");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  return (
    <>
      <Header />
      <div className="home-container">
        <header className="header">
          <h1>Bienvenue chez Garage Auto</h1>
          <p>Votre satisfaction, notre priorité</p>
        </header>
        <section className="services">
          <h2>Nos Services</h2>
          <ul>
            <li>Réparations</li>
            <li>Entretien</li>
            <li>Diagnostic</li>
            <li>Vente de véhicules</li>
          </ul>
        </section>
        {users.length > 0 && (
          <section className="clients">
            <h2>Statistiques clients</h2>
            {error && <p className="error">{error}</p>}
            <p>Nombre de clients : {users.length}</p>
            <table className="clients-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom de famille</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date de création</th>
                  <th>Modifier</th>
                  <th>Supprimer</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.lastname}</td>
                    <td>{user.firstname}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td> {/* Affichage du rôle */}
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData({
                            lastname: user.lastname,
                            firstname: user.firstname,
                            email: user.email,
                            id_role: user.id_role,
                          });
                          setShowEditModal(true);
                        }}
                      >
                        Modifier
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {showEditModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowEditModal(false)}>
                &times;
              </span>
              <h2>Modifier Utilisateur</h2>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Nom de famille"
                  value={formData.lastname}
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="text"
                  name="firstname"
                  placeholder="Prénom"
                  value={formData.firstname}
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleEditChange}
                  required
                />
                <select
                  name="id_role"
                  value={formData.id_role}
                  onChange={handleEditChange}
                  required
                >
                  <option value="" disabled>
                    Sélectionner un rôle
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button type="submit">Enregistrer</button>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </span>
              <h2>Supprimer Utilisateur</h2>
              <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <button onClick={handleDelete}>Oui</button>
              <button onClick={() => setShowDeleteModal(false)}>Non</button>
            </div>
          </div>
        )}
        <section className="contact">
          <h2>Contactez-nous</h2>
          <p>Adresse: 123 Rue de la vroum vroum, Paris</p>
          <p>Téléphone: +33 6 23 45 67 89</p>
          <p>Email: contact@garageauto.fr</p>
        </section>
      </div>
    </>
  );
};

export default HomePage;
