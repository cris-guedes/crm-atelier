
import NextAuth from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/auth";



const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
