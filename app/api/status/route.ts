import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { aw } from "vitest/dist/chunks/reporters.nr4dxCkA.js";

export const dynamic ='force-dynamic';

export async function  GET (request :NextRequest){
  try {
    const sessionId= request.cookies.get(
      "hostify_checkin_session"
    )?.value;

    if(!sessionId){
      return NextResponse.json({
        error:"no check-in seesion"
      }, {status :401});

    }

    const {data , error } = await supabaseAdmin
     .from("checkin_session")
     .select("id , team_id, status , approved_by , approved_at , expires_At")
     .eq("id ", sessionId)
     .single(); 

     if(error || !data){
      return  NextResponse.json({
        error : "check-in sessions not found"
      }, {status: 404 });
     }

     if(data.status === "waiting" && 
      new
      Date(data.expires_At).getTime() < Date.now()
     ) 
      await supabaseAdmin 
      .from("checkin_sessions")
      .update({status :"expired"})
      .eq("id", sessionId);

      return NextResponse.json({
        sessionId: data.id, 
        status: data.status,
        approvedBy :data.approved_by,
        approvedAt : data.approved_at,
        expiresAt: data.expires_At,
      });
     }catch(error){
      console.error(error);

      return NextResponse.json({
        error: "Internal server error"
      }, {status :500}
      );

    }

  }

     
