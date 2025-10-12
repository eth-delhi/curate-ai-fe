"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "../ui/Navbar";

interface CreateLayoutProps {
  children: React.ReactNode;
}

export default function CreateLayout({ children }: CreateLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb]">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-16">{children}</div>
    </div>
  );
}
