import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await signup(formData);
      alert(data.message || "Signup successful!");
      navigate("/login");
    } catch (err) {
      console.error("Signup Error:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a] flex items-center justify-center px-4">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-pink-500/30 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/30 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8"
        >
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-wide">
              SocialNet
            </h1>

            <p className="text-gray-300 mt-2 text-sm">
              Connect with friends and the world around you.
            </p>
          </div>

          {/* Fullname */}
          <div className="mb-4">
            <label className="block text-gray-200 mb-2 text-sm">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your fullname"
              value={formData.fullname}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullname: e.target.value,
                })
              }
              className="w-full bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-200 mb-2 text-sm">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-200 mb-2 text-sm">
              Password
            </label>

            <input
              type="password"
              placeholder="Create password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
              className="w-full bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500 text-white font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Footer */}
          <p className="text-center text-gray-300 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-pink-400 hover:text-pink-300 font-semibold transition"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;