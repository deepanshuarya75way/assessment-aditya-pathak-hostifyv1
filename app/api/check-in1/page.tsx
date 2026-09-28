"use client";

import { useEffect, useState } from "react";

type CheckInStatus =
| "idle"
| "waiting"
|"approved"
| "expired"
|"error"

export default function CheckInpage(){
  const [status, setStatus] = 
  useState<CheckInStatus>("idle");

  const [qrDataUrl , SetQrDataUrl]=
  useState<string | null>(null);

  const [expiresAt, setExpiresAT]= useState<string | null>(null);

  const [secondsLeft , setSecondLeft ]=
  useState<number>(0);


  const teamId ="Your_team_id";

  async function  startCheckIn(){
    setStatus("waiting"); 

    const response =await fetch("/api/check-in/create" , 
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json", 
        },
        body: JSON.stringify({
          teamId,
        }),

      }

    );


        const data =await response.json ();

        if(!response.ok){
          setStatus("error");
          return;
        }
         
        SetQrDataUrl(data.qrDataUrl);
        setExpiresAT(data.expiresAt);
      }

      useEffect(()=> {
        if(!expiresAt) return; 
 
        const interval = setInterval(()=>{
          const remaining =Math.max(0,
            Math.floor(
              (new Date(expiresAt).getTime()- Date.now())/ 1000
            )
          );

          setSecondLeft(remaining);

          if(remaining === 0){
            setStatus("expired");
            clearInterval(interval);
          }


        }, 1000);

        return ()=> clearInterval(interval);

      }, [expiresAt]);


      useEffect(()=>{
        if(status !== "waiting") return ;

        const interval = setInterval(async()=>{
          const response =await fetch ("api/status",
            {
              cache :"no-store"
            }
          );

          if(!response.ok) return ;

          const data =await response.json();

          if(data.status === "approved"){
            setStatus("expired");
            clearInterval(interval);
          }
        }, 1000);

        return ()=> clearInterval(interval);
      }, [status]);

      return (
        <main className="w-full max-w-md text-center">
          <div className="w-full max-w-md text-center"></div>
             <h1  className="text-3xl font-bold mb-6">
                           Team Check-In

             </h1>

            {status ==="idle" && (<button
              onClick={startCheckIn}
              className="px-6 py-3 rounded-1g bg-black text-white"
              >
                Start Team Check -In
              </button>
              
            )}

            {status ==="waiting" && qrDataUrl && (
              <div>
                <p className="mb-4">
                  Scan this Qr code using your mobile device.
                </p>
     
              <img 
              src={qrDataUrl}
              alt="team check in qr code"
              className="mx-auto w-80 h-80"
              />

              <p className=" mt-4 fonr-medium ">
                Waiting for approval.....
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Expires in {secondsLeft}s 
              </p>


              </div>
            )}

            {status ==="approved" && (
              <div className="p-6">
                <div className="text-5xl mb -4">
                  tick
                </div>

                <h2 className="text-2xl font-bold"> 
                  Team Checked In </h2>

                  <p className="mt-2 text-gray-500">
                    Mobile approval recieved successfully
                    </p>
              </div>
            )}

            {status ==="expired" && (
              <div>
                <p className="text-red-500 mb -4">
                  This Qr code has expired
                </p>

                <button
                onClick={startCheckIn}
                className="px-6 py-3 rounded-lg bg-black text white">
                  Generate New Qr 
                </button>

              </div>
            )}
          
          {status === "error" && (
            <p className="text-red-500">
            Unable to create a check-in session
            </p>

          )}

                </main>
      );
  }