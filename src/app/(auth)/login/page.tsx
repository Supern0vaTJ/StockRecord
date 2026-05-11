"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wallet, Eye, EyeOff } from "lucide-react";

type TabMode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<TabMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setSuccess("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/portfolioManager",
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess("Account created! Signing you in...");

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/portfolioManager",
        redirect: false,
      });

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl dark:bg-zinc-900/50 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center pb-6 pt-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
              <Wallet className="h-8 w-8 text-zinc-50 dark:text-zinc-900" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-base">
                {mode === "signin"
                  ? "Sign in to manage and track your portfolio."
                  : "Sign up to start managing your portfolio."}
              </CardDescription>
            </div>
          </CardHeader>

          {/* Tabs */}
          <div className="flex mx-6 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
            <button
              onClick={() => { setMode("signin"); resetForm(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); resetForm(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Google */}
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="h-12 text-base w-full shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => signIn("google", { callbackUrl: "/portfolioManager" })}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 488 512">
                      <path
                        fill="currentColor"
                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#111113] px-2 text-zinc-500 dark:text-zinc-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
                  className="grid gap-4"
                >
                  {mode === "signup" && (
                    <Input
                      id="name"
                      placeholder="Full Name (optional)"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="h-12"
                    />
                  )}

                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-12"
                  />

                  <div className="relative">
                    <Input
                      id="password"
                      placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg px-3 py-2">
                      {success}
                    </p>
                  )}

                  <Button
                    disabled={loading || !email || !password}
                    type="submit"
                    className="h-12 w-full text-base font-semibold shadow-md transition-shadow hover:shadow-lg"
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                  </Button>
                </form>
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 text-sm text-zinc-500 dark:text-zinc-400">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
