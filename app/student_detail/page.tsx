"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function StudentDetailPage() {
  useEffect(() => {
    // Redirect to student list
    redirect("/student");
  }, []);

  return null;
}