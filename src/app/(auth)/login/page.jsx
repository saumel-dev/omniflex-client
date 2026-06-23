"use client";

import React, { useState } from "react";
import { Form, TextField, Input, Label, FieldError, Button } from "@heroui/react";
import { motion } from "motion/react";
import { authClient } from "@/app/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/", // Redirects to intended route or Home on successful verification
    });

    if (error) {
      setErrorMsg(error.message || "Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    // Crucial fix: flex, items-center, justify-center and min-h ensures true viewport centering
    <div className="flex min-h-[85vh] w-full items-center justify-center px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-divider bg-content1/70 backdrop-blur-md p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-default-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-default-500">
            Dont have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
              Sign up free
            </Link>
          </p>
        </div>

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-danger-500/10 p-3 text-sm text-danger border border-danger-500/20 mb-6 text-center"
          >
            {errorMsg}
          </motion.div>
        )}

        <Form className="flex flex-col gap-6" onSubmit={handleCredentialsLogin}>
          <TextField
            isRequired
            name="email"
            type="email"
            labelPlacement="outside"
            validate={(value) => {
              if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return "Please enter a valid email address";
              }
              return null;
            }}
          >
            <Label className="font-semibold text-xs tracking-wider text-default-600 uppercase">Email Address</Label>
            <Input 
              placeholder="you@example.com" 
              variant="bordered"
              size="lg" 
              className="mt-1.5" 
              classNames={{
                inputWrapper: "h-12 border-default-200 hover:border-primary focus-within:!border-primary transition-colors duration-200"
              }}
            />
            <FieldError className="text-xs text-danger mt-1 font-medium" />
          </TextField>

          <TextField
            isRequired
            name="password"
            type="password"
            labelPlacement="outside"
          >
            <Label className="font-semibold text-xs tracking-wider text-default-600 uppercase">Password</Label>
            <Input 
              placeholder="••••••••" 
              variant="bordered"
              size="lg" 
              className="mt-1.5"
              classNames={{
                inputWrapper: "h-12 border-default-200 hover:border-primary focus-within:!border-primary transition-colors duration-200"
              }}
            />
            <FieldError className="text-xs text-danger mt-1 font-medium" />
          </TextField>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20 h-12 mt-2 text-white bg-primary transition-transform active:scale-98"
            isLoading={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-divider"></div>
          <span className="mx-4 flex-shrink text-xs uppercase text-default-400 font-bold tracking-widest">OR</span>
          <div className="flex-grow border-t border-divider"></div>
        </div>

        <Button
          variant="bordered"
          size="lg"
          className="w-full font-semibold border-default-200 hover:bg-default-100 h-12 transition-all duration-200"
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
      </motion.div>
    </div>
  );
}