import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { addHolding, exitHolding, listHoldings } from "@/lib/portfolio-db";
function revalidatePortfolioPages(){revalidatePath("/");revalidatePath("/portfolio");revalidatePath("/risk");revalidatePath("/performance");}
export async function GET(){return NextResponse.json({holdings:await listHoldings()});}
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);if(!isAdminRequest(req, body?.passcode))return NextResponse.json({error:"Invalid admin passcode."},{status:401});
 const symbol=String(body?.symbol??"").trim().toUpperCase(),companyName=String(body?.companyName??"").trim(),sector=String(body?.sector??"").trim(),entryDate=String(body?.entryDate??"").trim(),decisionId=String(body?.decisionId??"").trim();
 const quantity=Number(body?.quantity),avgCost=Number(body?.avgCost);
 if(!symbol||!companyName||!sector||!entryDate||!decisionId)return NextResponse.json({error:"Symbol, company, sector, entry date and an approved IC decision are required."},{status:400});
 if(!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(avgCost)||avgCost<=0)return NextResponse.json({error:"Quantity and average cost must be positive numbers."},{status:400});
 try{const holding=await addHolding({symbol,companyName,sector,quantity,avgCost,entryDate,decisionId});revalidatePortfolioPages();return NextResponse.json({holding},{status:201});}catch(err){return NextResponse.json({error:err instanceof Error?err.message:"Failed to post position."},{status:400});}
}
export async function PATCH(req:NextRequest){
 const body=await req.json().catch(()=>null);if(!isAdminRequest(req, body?.passcode))return NextResponse.json({error:"Invalid admin passcode."},{status:401});
 const id=String(body?.id??"").trim(),exitDate=String(body?.exitDate??"").trim(),decisionId=String(body?.decisionId??"").trim();const exitPrice=Number(body?.exitPrice),quantity=body?.quantity==null?undefined:Number(body.quantity);
 if(!id||!exitDate||!decisionId||!Number.isFinite(exitPrice)||exitPrice<=0||quantity!==undefined&&(!Number.isFinite(quantity)||quantity<=0))return NextResponse.json({error:"Position, exit date, exit price, quantity and an approved IC decision are required."},{status:400});
 try{const ok=await exitHolding(id,exitDate,exitPrice,decisionId,quantity);if(!ok)return NextResponse.json({error:"Active position not found."},{status:404});revalidatePortfolioPages();return NextResponse.json({ok:true});}catch(err){return NextResponse.json({error:err instanceof Error?err.message:"Failed to post sell."},{status:400});}
}
export async function DELETE(){return NextResponse.json({error:"Positions are derived from the transaction ledger and cannot be deleted."},{status:405});}
