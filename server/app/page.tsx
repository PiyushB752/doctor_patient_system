"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function Home() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large" }
      );
    };
  }, []);

  async function handleGoogleLogin(response: any) {
    console.log("Google ID Token:", response.credential);

    const res = await fetch("/backend/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: response.credential,
        role: "doctor", 
      }),
    });

    const data = await res.json();
    console.log("Backend Response:", data);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Google Auth Test</h1>
      <div id="google-btn"></div>
    </main>
  );
}