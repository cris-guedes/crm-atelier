"use client";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "next-auth/react";

import { useEffect } from "react";


export default function LogOut() {
  useEffect(() => {
    signOut();
  }, []);
  return <Spinner className="m-auto" size={"large"} />;
};
