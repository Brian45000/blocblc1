import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCookie } from "../utils/cookies";
import "./SigninForm.css";

const baseURI = import.meta.env.VITE_API_BASE_URL;

const SigninForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(baseURI + "api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCookie("token", data.token, 1);
        alert("Connexion réussie");
        navigate("/");
      } else {
        alert("Erreur lors de la connexion");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  return (
    <form className="signin-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default SigninForm;
