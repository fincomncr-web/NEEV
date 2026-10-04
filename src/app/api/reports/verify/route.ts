import {NextRequest,NextResponse} from "next/server";
import {ADMIN_COOKIE,checkPasscode,createAdminToken} from "@/lib/admin-auth";
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);if(!checkPasscode(body?.passcode))return NextResponse.json({error:"Incorrect passcode."},{status:401});
 const token=createAdminToken();if(!token)return NextResponse.json({error:"Admin session is not configured."},{status:503});
 const res=NextResponse.json({ok:true});res.cookies.set(ADMIN_COOKIE,token,{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:8*60*60});return res;
}
