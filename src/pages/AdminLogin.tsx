import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import logo from "@/assets/logo.jpg";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/admin");
  }, [session, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
      else setMessage("Check your email for a confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="Hair Dot Com" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
          </Link>
          <h1 className="font-heading text-2xl text-primary mb-2">Admin Portal</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage your salon</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 mb-6">
              {message}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <input
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name" required
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            )}
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" required
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required minLength={6}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button type="submit" disabled={loading}
              className="w-full gold-gradient text-primary-foreground py-3 text-sm font-medium tracking-wider uppercase rounded transition-all duration-300 hover:opacity-90 disabled:opacity-40">
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>

          <button onClick={handleGoogleLogin}
            className="w-full bg-secondary/50 border border-border/50 rounded-lg py-3 text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
              className="text-primary hover:underline">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
