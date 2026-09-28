import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

import { hashCheckInToken } from "@/lib/checkin-token";
import { error } from "console";

export const dynamic ='force-dynamic';

export async function POST(request:NextRequest) 
{
  try{
    const body=await  request.json();

    const token =body.token;

    if(!token){
      return NextResponse.json({
        error: "Missing approval token "
      }, {status :400});
    }

    const tokenHash =hashCheckInToken(token);

    const {data:session , error} =await supabaseAdmin
       .from("checkin_session")
      .select("id, team_id , status, expires_at")
      .eq("token_hash", tokenHash)
      .single();

      if(error || !session){
        return NextResponse.json({
          error:"Invalid QR code"
        }, {status :404});
      }
     

      if(new 

        Date(session.expires_at).getTime() < Date.now()
      ){
          await supabaseAdmin
          .from("checkin_session")
          .update({
            status:"expired",
          }).eq("id",session.id);

          return NextResponse.json(
            {error:"QR code has expired"},
            {status :410}
          );

      }


      // prevent double approval 

      if(session.status !=="waiting"){
        return NextResponse.json(
          {
            error : 'Check-in is already ${session.status}',
             
          },
          {
             status: 409
          }
        );
      }
        

      const approvedBy= "Authenticated_user_id";
      const {data :updated , error :updateError }= 
        await supabaseAdmin 
        .from("checkin_sessions")
        .update({
          status:"approved",
          approved_by :approvedBy,
          approved_at : new 
          Date().toISOString(),
          })
          .eq("id", session.id)
          .eq("status","waiting")
          .select(
            "id, team_id, status, approved_at"
          )
          .single();


          if(updateError || !updated){
            return NextResponse.json({
              error:"Unable to approve check-in"
            }, {status: 409});
          }


          return NextResponse.json({
            success :true,
            status: "approved",
            sessionId : updated.id,
          });

        } catch (error){
          console.error(error);

          return NextResponse.json({
            error: "internal server error"
          }, {status: 500});
        }





  }
