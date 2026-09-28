"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Inner component that safely consumes search parameters
function CheckInApprovalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"ready" | "approving" | "approved" | "error">("ready");

  async function approveCheckIn() {
    if (!token) {
      setStatus("error");
      return;
    }

    setStatus("approving");

    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        setStatus("error");
        return;
      }

      setStatus("approved");
    } catch (error) {
      console.error("Network error:", error);
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-500 font-medium">Invalid check-in QR code</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {status === "ready" && (
          <>
            <h1 className="text-2xl font-bold">Team Check-In</h1>
            <p className="mt-3 text-gray-500">You are approving a team check-in</p>
            <button
              onClick={approveCheckIn}
              className="mt-8 px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Approve Check-In
            </button>
          </>
        )}

        {status === "approving" && (
          <>
            <h1 className="text-2xl font-bold text-gray-700 animate-pulse">Approving...</h1>
            <p className="mt-3 text-gray-500">Please wait while we process your request.</p>
          </>
        )}

        {status === "approved" && (
          <>
            <h1 className="text-2xl font-bold text-green-600">Success!</h1>
            <p className="mt-3 text-gray-500">The team check-in has been successfully approved.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600">Approval Failed</h1>
            <p className="mt-2 text-gray-500">The QR code may have expired or already been used.</p>
          </>
        )}
      </div>
    </main>
  );
}

// Main page component providing the required Suspense fallback
export default function CheckInApprovalPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-500 animate-pulse">Loading check-in details...</p>
      </main>
    }>
      <CheckInApprovalContent />
    </Suspense>
  );
}
