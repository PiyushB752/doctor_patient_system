"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function Home() {
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

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
    setGoogleToken(response.credential);

    const res = await fetch("/backend/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: response.credential,
      }),
    });

    const data = await res.json();
    console.log("Backend Response:", data);

    if (!res.ok) {
      setShowRoleSelection(true);
      return;
    }

    localStorage.setItem("token", data.token);
    redirectUser(data.user.role);
  }

  async function handleRoleSelect(role: "doctor" | "patient") {
    if (!googleToken) return;

    const res = await fetch("/backend/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: googleToken,
        role,
      }),
    });

    const data = await res.json();
    console.log("Account created:", data);

    localStorage.setItem("token", data.token);
    redirectUser(role);
  }

  function redirectUser(role: string) {
    if (role === "doctor") {
      window.location.href = "/doctor";
    } else {
      window.location.href = "/patient";
    }
  }

  return (
    <main>
      <h1>Google Auth Test</h1>

      {!showRoleSelection && <div id="google-btn"></div>}

      {showRoleSelection && (
        <>
          <p>Select account type:</p>
          <button onClick={() => handleRoleSelect("doctor")}>
            Doctor
          </button>
          <button onClick={() => handleRoleSelect("patient")}>
            Patient
          </button>
        </>
      )}
    </main>
  );
}