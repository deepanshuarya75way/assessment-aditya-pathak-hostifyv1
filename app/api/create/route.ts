import { NextRequest, NextResponse } from "next/server";

import { QRCode } from "qrcode";

import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  generateCheckInToken, hashCheckInToken, 
} from '@/lib/checkin-token';
import { getMaxAge } from "next/dist/server/image-optimizer";

export async function POST (request: NextRequest){
  try{
    const body =await
    request.json();

    const teamId = body.teamId;

     if(!teamId){
      return NextResponse.json(
        {
          error:"teamId is required"
        },
        {
          status: 400
        }
      );
     }


     const token = generateCheckInToken();
     const tokenHash= hashCheckInToken(token);

     const expires = new Date(Date.now()+2*60 * 1000).toISOString();

     const {data,error}=await supabaseAdmin
       .from("Checkin_sessions")
       .insert({
        token_id: teamId,
        token_hash :tokenHash,
        status :"waiting", 
        expires_at : expiresAt, 
       })
         .select("id , team_id, status, expires_at")
          .single();

          if (error){
            console.error(error);

            return NextResponse.json({
              error : "failed to create check-in session"
            }, {status :500});
          }

          const origin = request.nextUrl.origin;

          const approvalUrl ='${origin}/check-in/approve?token=${token}';
        
          const qrDataUrl = await QRCode.toDataURL(approvalUrl, {
            width:320, 
            margin:2 ,
            errorCorrectionLevel: "M",
          });


          const response =NextResponse.json({
            sessionId :data.id, 
            qrDataUrl,
            expiresAt,
            status: data.status,
          })

          response.cookies.set(
            "hostify_checkin_session",
            data.id,
          {
            httpOnly: true,
            secure : process.env.NODE_ENV ==="production",
            sameSite :"lax",
            path:"/",
            maxAge :120,
          } 
        );

        return response;
      } catch(error){
        console.error(error);

        return NextResponse.json({
          error: "Internal server error"
        }, {status :500});

      }
    }

