import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const loggedInUser = await login({ email, password });

      if (loggedInUser) {
        alert("Logged in successfully!");
        e.target.reset();

        setTimeout(() => {
          navigate("/profile");
        }, 500);
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.message || "Wrong email or password");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a] flex items-center justify-center px-4">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/30 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-pink-500/30 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-wide">
              SocialNet
            </h1>

            <p className="text-gray-300 mt-2 text-sm">
              Welcome back! Connect with your friends again.
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-200 mb-2 text-sm">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-200 mb-2 text-sm">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              className="w-full bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
          >
            Log In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-white/20"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-white/20"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl transition-all"
            >
              <a
  href="http://localhost:3000/api/auth/google"
>
  Google
</a>
            </button>

            <button
              type="button"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl transition-all"
            >
              Facebook
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-300 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-pink-400 hover:text-pink-300 font-semibold transition"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;