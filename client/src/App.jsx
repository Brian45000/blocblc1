import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import AuthPage from "./components/AuthPage";
import { getCookie } from "./utils/cookies";
import "./App.css";

const baseURI = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      fetch(baseURI + "api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.valid) {
            setIsAuthenticated(true);
            navigate("/");
          } else {
            setIsAuthenticated(false);
            navigate("/auth");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsAuthenticated(false);
          navigate("/auth");
        });
    } else {
      setIsAuthenticated(false);
      navigate("/auth");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <HomePage /> : <AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;
