import bg from "../../assets/bg.webp";
import logo from "../../assets/logo.png";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { HiInformationCircle } from "react-icons/hi2";
import toast from 'react-hot-toast';
import { Loading } from "../../components/ui/Loading";
import { 
  login, 
  isAuthenticated, 
  initializeAuth, 
  isAccountLocked,
  getCurrentUsername
} from "../../utils/auth";

// Secure login page with robust authentication
export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth system
    initializeAuth();
    
    // Check if already authenticated
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Basic validation
    if (!username.trim()) {
      toast.error("Username is required");
      document.getElementById("username")?.focus();
      return;
    } 
    
    if (!password) {
      toast.error("Password is required");
      document.getElementById("password")?.focus();
      return;
    }

    // Check if account is locked
    if (isAccountLocked()) {
      toast.error("Account is temporarily locked due to too many failed attempts");
      return;
    }

    setIsLoading(true);

    try {
      // Attempt login with new secure auth system
      const result = login(username.trim(), password);

      if (result.success) {
        setSuccess(true);
        toast.success(result.message);
        
        // Show loading screen briefly before redirect
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(result.message);
        
        // Clear password on failed attempt
        setPassword("");
        
        if (result.attemptsLeft !== undefined && result.attemptsLeft <= 2) {
          toast.warning(`Warning: Only ${result.attemptsLeft} attempts remaining before account lock`);
        }
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="w-screen h-screen flex justify-center items-center relative bg-base-200">
      <img src={bg} alt="Background Image" className="w-full h-full object-cover absolute top-0 left-0 z-0 opacity-20"/>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 relative backdrop-blur-md bg-base-100/90 p-10 rounded-2xl shadow-2xl border border-base-300 flex flex-col space-y-6 justify-center items-center max-w-md w-full mx-4"
      >
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col justify-center items-center space-y-2"
        >
          <img src={logo} alt="Logo" className="w-32 h-auto"/>
          <h1 className="font-bold text-primary text-2xl text-center">Lotus Fitness Center</h1>
          <p className="text-base-content/70 text-center">Management System</p>
        </motion.div>

        {/* Login Form or Success Message */}
        {!success ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4 w-full"
          >
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* Default Credentials Info */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs font-bold">i</span>
                </div>
                <div className="text-base-content">
                  <div className="font-semibold text-primary mb-1">Default credentials:</div>
                  <div className="space-y-1 text-base-content/80">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Username:</span>
                      <code className="bg-base-200 px-2 py-0.5 rounded text-xs">admin</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Password:</span>
                      <code className="bg-base-200 px-2 py-0.5 rounded text-xs">lotus2024</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About link for mobile - below default credentials */}
            <div className="block lg:hidden text-center">
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 text-sm text-base-content/70 hover:text-primary transition-colors"
              >
                <HiInformationCircle className="w-4 h-4" />
                About this app
              </Link>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-primary mb-4">
              Welcome, {getCurrentUsername() || username}! 🎉
            </p>
            <Loading/>
          </motion.div>
        )}
      </motion.div>

      {/* Floating About button for desktop - bottom right corner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="hidden lg:block fixed bottom-6 right-6 z-20"
      >
        <Link 
          to="/about"
          className="btn btn-circle btn-primary shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="About this app"
        >
          <HiInformationCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}