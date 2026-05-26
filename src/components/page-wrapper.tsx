"use client";

import Header from "@/components/header";
import { useEffect } from "react";

// We'll use a custom hook to update the header title per page
// For simplicity, each page will render its own Header inline
export function PageHeader({ title }: { title: string }) {
  return <Header title={title} />;
}
