import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { addDecision, listDecisions } from "@/lib/portfolio-db";
const VALID_DECISIONS=["BUY","HOLD","SELL"],VALID_STATUS=["DRAFT","APPROVED","REJECTED","AMENDED","SUPERSEDED"];
export async function GET(){return NextResponse.json({decisions:await listDecisions()});}
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);if(!isAdminRequest(req, body?.passcode))return NextResponse.json({error:"Invalid admin passcode."},{status:401});
 const date=String(body?.date??"").trim(),sector=String(body?.sector??"").trim(),decision=String(body?.decision??"").trim().toUpperCase(),rationale=String(body?.rationale??"").trim();
 const companyName=body?.companyName?String(body.companyName).trim():null,symbol=body?.symbol?String(body.symbol).trim().toUpperCase():null,status=String(body?.status??"DRAFT").trim().toUpperCase();
 const proposedWeight=body?.proposedWeight==null?null:Number(body.proposedWeight),votesFor=body?.votesFor==null?null:Number(body.votesFor),votesAgainst=body?.votesAgainst==null?null:Number(body.votesAgainst),abstentions=body?.abstentions==null?null:Number(body.abstentions),quorum=body?.quorum==null?null:Number(body.quorum);
 if(!date||!sector||!rationale||!VALID_DECISIONS.includes(decision)||!VALID_STATUS.includes(status))return NextResponse.json({error:"Date, sector, decision, rationale and a valid status are required."},{status:400});
 if([proposedWeight,votesFor,votesAgainst,abstentions,quorum].some(x=>x!==null&&!Number.isFinite(x)))return NextResponse.json({error:"Numeric IC fields must be valid numbers."},{status:400});
 if(proposedWeight!==null&&(proposedWeight<0||proposedWeight>1))return NextResponse.json({error:"Proposed weight must be between 0% and 100%."},{status:400});
 if(status==="APPROVED"&&!body?.approvedAt)return NextResponse.json({error:"Approved decisions require an approval timestamp."},{status:400});
 try{const d=await addDecision({date,sector,companyName,symbol,decision:decision as "BUY"|"HOLD"|"SELL",rationale,voteCount:body?.voteCount?String(body.voteCount).trim():null,status,meetingReference:body?.meetingReference?String(body.meetingReference).trim():null,quorum,votesFor,votesAgainst,abstentions,proposedWeight,riskNotes:body?.riskNotes?String(body.riskNotes).trim():null,thesisBreakers:body?.thesisBreakers?String(body.thesisBreakers).trim():null,approvedAt:body?.approvedAt??null,caseId:body?.caseId??null});revalidatePath("/");revalidatePath("/portfolio");revalidatePath("/portfolio/register");return NextResponse.json({decision:d},{status:201});}catch(err){return NextResponse.json({error:err instanceof Error?err.message:"Failed to save decision."},{status:400});}
}
export async function DELETE(){return NextResponse.json({error:"Decision records are immutable. Amend or supersede them instead of deleting."},{status:405});}
