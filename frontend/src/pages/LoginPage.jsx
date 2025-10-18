import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // Redirect based on role
      if (user.role === "doctor") navigate("/dashboard/doctor");
      else if (user.role === "caretaker") navigate("/dashboard/caretaker");
      else navigate("/dashboard/patient");
    } catch (err) {
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form
        onSubmit={handleLogin}
        className="flex flex-col bg-white p-6 rounded-lg shadow-lg w-80"
      >
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
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;

