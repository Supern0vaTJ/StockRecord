"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("credentials", { email, callbackUrl: "/" });
    setLoading(false);
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
          <CardHeader className="space-y-4 text-center pb-8 pt-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
              <Wallet className="h-8 w-8 text-zinc-50 dark:text-zinc-900" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to manage and track your portfolio.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <Button 
                variant="outline" 
                className="h-12 text-base w-full shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Continue with Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#111113] px-2 text-zinc-500 dark:text-zinc-400">
                  Or continue with email
                </span>
              </div>
            </div>
            <form onSubmit={handleEmailSignIn} className="grid gap-4">
              <div className="grid gap-2">
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
              </div>
              <Button disabled={loading || !email} type="submit" className="h-12 w-full text-base font-semibold shadow-md transition-shadow hover:shadow-lg">
                {loading ? "Signing In..." : "Sign In with Email"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 text-sm text-zinc-500 dark:text-zinc-400">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
