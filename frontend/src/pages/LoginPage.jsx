// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password); // uses AuthContext
      const user = res.data.user;
      // redirect by role
      if (user.role === "doctor") navigate("/doctor", { replace: true });
      else if (user.role === "caretaker") navigate("/caretaker", { replace: true });
      else navigate("/patient", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid credentials or server error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col bg-white p-6 rounded-lg shadow-lg w-80">
        <input
          className="mb-3 p-2 border border-gray-300 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mb-3 p-2 border border-gray-300 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
