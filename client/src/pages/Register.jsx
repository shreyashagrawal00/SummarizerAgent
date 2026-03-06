import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [uploadMode, setUploadMode] = useState("url"); // "url" or "file"
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation
    const hasUpperCase = /[A-Z]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough || !hasUpperCase) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter.");
      return;
    }

    setIsLoading(true);
    try {
      await API.post("/auth/register", { name, email, password, profilePicture });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(10vh-64px)] flex items-center justify-center bg-background-light dark:bg-slate-950 p-6 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="material-symbols-outlined text-4xl">person_add</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white transition-colors">Create Account</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">Join Briefly and start your journey</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 text-sm transition-colors">
                <span className="material-symbols-outlined text-xl">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                    )}
                  </div>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={() => setProfilePicture("")}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${uploadMode === "url" ? "bg-primary text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${uploadMode === "file" ? "bg-primary text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                  >
                    Upload File
                  </button>
                </div>
                <div className="mt-3 w-full">
                  {uploadMode === "url" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 transition-colors text-sm">link</span>
                      <input
                        type="url"
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-primary transition-all text-slate-900 dark:text-slate-100"
                        placeholder="Paste image URL..."
                        value={uploadMode === "url" ? profilePicture : ""}
                        onChange={(e) => setProfilePicture(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        id="profile-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="profile-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-semibold text-slate-600 dark:text-slate-400"
                      >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        Choose an image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 transition-colors">person</span>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 transition-colors">mail</span>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 transition-colors">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Password Requirements UI */}
                <div className="mt-3 space-y-2">
                  <div className={`flex items-center gap-2 text-xs transition-colors ${password.length >= 8 ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {password.length >= 8 ? "check_circle" : "circle"}
                    </span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${/[A-Z]/.test(password) ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {/[A-Z]/.test(password) ? "check_circle" : "circle"}
                    </span>
                    One uppercase letter
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 p-6 text-center transition-colors">
            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
              Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
