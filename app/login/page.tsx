"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ LOGIN EMAIL PASSWORD
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // สำคัญ
    });

    setLoading(false);

    if (res?.error) {
      setError("Email หรือ Password ไม่ถูกต้อง");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow w-[380px] space-y-4">

        <h1 className="text-2xl font-bold text-center">
          Student Support Login
        </h1>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* EMAIL LOGIN */}
        <form onSubmit={handleCredentialsLogin} className="space-y-3">

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-gray-400">OR</div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Login with Google
        </button>

        {/* FACEBOOK LOGIN */}
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
          className="w-full bg-blue-800 text-white p-2 rounded"
        >
          Login with Facebook
        </button>

      </div>
    </div>
  );
}