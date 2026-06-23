"use client";

import React, { useState } from "react";
import { Form, TextField, Input, Label, FieldError, Button, Description } from "@heroui/react";
import { motion } from "motion/react";
import { authClient } from "@/app/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); 
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setUploadStatus("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const imageFile = formData.get("imageFile"); 

    let uploadedImageUrl = "";

    // 1. Only run ImgBB uploading logic if the user picked a file
    if (imageFile && imageFile.name) {
      setUploadStatus("Uploading profile image to ImgBB...");
      
      const imgData = new FormData();
      imgData.append("image", imageFile);

      try {
        const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
          method: "POST",
          body: imgData,
        });

        const resData = await res.json();

        if (resData.success) {
          uploadedImageUrl = resData.data.url; 
        } else {
          throw new Error("ImgBB file processing failed.");
        }
      } catch (err) {
        setErrorMsg("Failed to upload your profile image. Please try again.");
        setLoading(false);
        setUploadStatus("");
        return;
      }
    }

    // 2. Submit the registration payload to Better-Auth using the new ImgBB URL
    setUploadStatus("Creating your account secure profile...");
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      image: uploadedImageUrl || undefined, 
      callbackURL: "/",
    });

    if (error) {
      setErrorMsg(error.message || "Something went wrong during registration.");
      setLoading(false);
      setUploadStatus("");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-divider bg-content1/70 backdrop-blur-md p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-default-500 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-default-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
              Sign in
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

        <Form className="flex flex-col gap-5" onSubmit={handleRegister}>
          <TextField isRequired name="name" type="text" labelPlacement="outside">
            <Label className="font-semibold text-xs tracking-wider text-default-600 uppercase">Full Name</Label>
            <Input 
              placeholder="Alex Johnson" 
              variant="bordered"
              size="lg" 
              className="mt-1.5" 
              className="h-12 w-full rounded-xl border border-default-200 bg-transparent px-3 text-sm outline-none transition-colors duration-200 hover:border-primary focus:border-primary"
            />
            <FieldError className="text-xs text-danger mt-1 font-medium" />
          </TextField>

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
              className="h-12 w-full rounded-xl border border-default-200 bg-transparent px-3 text-sm outline-none transition-colors duration-200 hover:border-primary focus:border-primary"
            />
            <FieldError className="text-xs text-danger mt-1 font-medium" />
          </TextField>

          {/* FIXED: Using standard accessible elements to perfectly process filenames without React DOM warnings */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs tracking-wider text-default-600 uppercase">
              Upload Profile Avatar <span className="text-default-400 font-normal lowercase">(optional)</span>
            </label>
            <input 
              type="file"
              name="imageFile"
              accept="image/*"
              className="h-12 w-full file:mr-4 file:py-1 file:px-3 file:h-full file:border-0 file:text-xs file:font-semibold file:bg-default-200 file:text-default-700 hover:file:bg-default-300 file:cursor-pointer rounded-xl border border-default-200 bg-transparent px-3 text-sm transition-colors duration-200 hover:border-primary focus:border-primary cursor-pointer pt-2.5"
            />
          </div>

          <TextField
            isRequired
            name="password"
            type="password"
            labelPlacement="outside"
            validate={(value) => {
              if (value.length < 6) {
                return "Password must be at least 6 characters";
              }
              if (!/[A-Z]/.test(value)) {
                return "Password must contain at least one uppercase letter";
              }
              if (!/[a-z]/.test(value)) {
                return "Password must contain at least one lowercase letter";
              }
              return null;
            }}
          >
            <Label className="font-semibold text-xs tracking-wider text-default-600 uppercase">Password</Label>
            <Input 
              placeholder="••••••••" 
              variant="bordered"
              size="lg" 
              className="mt-1.5"
              className="h-12 w-full rounded-xl border border-default-200 bg-transparent px-3 text-sm outline-none transition-colors duration-200 hover:border-primary focus:border-primary"
            />
            <Description className="text-xs text-default-400 mt-1.5 leading-relaxed block">
              Must be at least 6 characters with 1 uppercase and 1 lowercase letter
            </Description>
            <FieldError className="text-xs text-danger mt-1 font-medium" />
          </TextField>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20 h-12 mt-4 text-white bg-primary transition-transform active:scale-98"
            isLoading={loading}
          >
            {loading ? (uploadStatus || "Creating Account...") : "Create Account"}
          </Button>
        </Form>
      </motion.div>
    </div>
  );
}