"use client";
import {useEffect,useState,type FormEvent} from "react";
import type {Decision} from "@/lib/portfolio-db";
import {SECTORS} from "@/lib/sectors";
export default function DecisionsAdminPanel({passcode}:{passcode:string}){
 const[decisions,setDecisions]=useState<Decision[]>([]),[loading,setLoading]=useState(true),[submitting,setSubmitting]=useState(false),[message,setMessage]=useState<{type:"error"|"success";text:string}|null>(null);
 async function load(){setLoading(true);try{const r=await fetch("/api/portfolio/decisions");const d=await r.json();setDecisions(d.decisions??[]);}finally{setLoading(false);}}
 useEffect(()=>{queueMicrotask(load);},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setSubmitting(true);setMessage(null);const f=new FormData(e.currentTarget);const body=Object.fromEntries(f.entries());try{const r=await fetch("/api/portfolio/decisions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({passcode,...body,status:body.status,approvedAt:body.status==="APPROVED"?new Date().toISOString():null})});const d=await r.json();if(!r.ok){setMessage({type:"error",text:d.error??"Failed to save decision."});return;}setMessage({type:"success",text:"IC decision recorded in the controlled register."});e.currentTarget.reset();await load();}catch{setMessage({type:"error",text:"Failed to save decision."});}finally{setSubmitting(false);}}
 return <div>
  <div className="mb-6 rounded-md border border-accent/30 bg-accent/5 p-4 text-sm text-muted"><span className="font-medium text-foreground">Controlled IC register.</span> Decisions are immutable. Approved decisions are required before portfolio trades can be posted.</div>
  {message&&<div className={"mb-6 rounded-md border px-4 py-3 text-sm "+(message.type==="error"?"border-down/30 bg-down/5 text-down":"border-up/30 bg-up/5 text-up")}>{message.text}</div>}
  <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2">
   <label className="text-sm">Decision date<input type="date" name="date" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="text-sm">Sector<select name="sector" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option>{SECTORS.map(s=><option key={s.slug} value={s.name}>{s.name}</option>)}</select></label>
   <label className="text-sm">Company<input name="companyName" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="text-sm">Symbol<input name="symbol" placeholder="e.g. RELIANCE.NS" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="text-sm">Decision<select name="decision" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option><option>BUY</option><option>HOLD</option><option>SELL</option></select></label>
   <label className="text-sm">Status<select name="status" required defaultValue="DRAFT" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option>DRAFT</option><option>APPROVED</option><option>REJECTED</option></select></label>
   <label className="text-sm">Meeting reference<input name="meetingReference" placeholder="IC-2026-09-01" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="text-sm">Proposed weight<input name="proposedWeight" type="number" min="0" max="1" step="0.001" placeholder="0.08" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="sm:col-span-2 text-sm">Risk notes<textarea name="riskNotes" rows={2} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="sm:col-span-2 text-sm">Thesis-break conditions<textarea name="thesisBreakers" rows={2} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="sm:col-span-2 text-sm">Rationale<textarea name="rationale" required rows={4} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="text-sm">Vote count<input name="voteCount" placeholder="6-0" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <label className="text-sm">Quorum<input name="quorum" type="number" min="1" step="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"/></label>
   <button disabled={submitting} className="sm:col-span-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] disabled:opacity-60">{submitting?"Recording…":"Record IC Decision"}</button>
  </form>
  <div className="mt-8"><h3 className="text-sm font-semibold">Decision Register</h3>{loading?<p className="mt-3 text-sm text-muted">Loading…</p>:!decisions.length?<p className="mt-3 text-sm text-muted">No decisions recorded yet.</p>:<div className="mt-3 space-y-2">{decisions.map(d=><div key={d.id} className="card p-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{d.decision} · {d.companyName??d.sector}</p><span className="font-mono text-xs text-muted">{d.status}</span></div><p className="mt-1 text-xs text-muted">{d.date} · {d.sector}{d.voteCount?" · "+d.voteCount:""}{d.meetingReference?" · "+d.meetingReference:""}</p><p className="mt-2 text-muted">{d.rationale}</p></div>)}</div>}</div>
 </div>;
}
