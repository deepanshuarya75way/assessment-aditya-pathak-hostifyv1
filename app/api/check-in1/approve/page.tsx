"use client";

import { useSearchParams } from "next/navigation";

import { useState } from "react";
export default function CheckInApprovalPage(){
  const searchParams = useSearchParams();

  const token= searchParams.get("token");
 
  const [status ,setStatus] =
   useState<"ready" |"approving" |"approved" |"error">(
    "ready"
   );

   async function approveCheckIn(){
    if(!token){
      setStatus("error");
      return ;
    }

    setStatus("approving");

    const response =await fetch ("/api/approve", {
      method :"POST",
      headers:{
        "Content-Type":"application/json",
            },
            body :JSON.stringify({
              token,
            }),
    });

    const data =await response.json();

    if(!response.ok){
      console.error(data);
      setStatus("error");
      return;
    }

    setStatus("approved");

  }

  if(!token){
    return (
      <main className="min-h screen flex items-center justify -center">
        <p> invalid check -in qr code</p>

        </main>
    );
  }

  return (
        <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center"> {status=== "ready" &&(
              <>
        
          <h1 className="text-2xl font-bold">
            Team check_in
          </h1>
          <p className="mt-3 text-gray-500">
            you are approving a team check-in 
          </p>

          <button

          onClick={approveCheckIn}
          className="mt-8 px-6  py-3 rounded-lg bg-black text-white">
            Approve check_in
          </button>
            </>
      )}
          {status==="error" && (
                    <>
                    

                    <h1 className="text-x1 font-bold">
                      approval failed 
                    </h1>

                    <p className="mt-2 text-red-500">
                      the qr code may have expired or already been used 
                    </p>
          </>

          
        )}     </div>

    </main>  
  );

}