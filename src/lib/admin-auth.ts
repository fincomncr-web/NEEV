import {createHmac,timingSafeEqual} from "crypto";
import type {NextRequest} from "next/server";
export const ADMIN_COOKIE="neev_admin_session";
const PASSCODE=process.env.REPORTS_UPLOAD_PASSCODE;
const SECRET=process.env.ADMIN_SESSION_SECRET||PASSCODE;
export function checkPasscode(passcode:unknown){return !!PASSCODE&&typeof passcode==="string"&&passcode.length>0&&passcode===PASSCODE;}
function token(){if(!SECRET)return null;const payload=`neev-admin.${Date.now()}`;return payload+"."+createHmac("sha256",SECRET).update(payload).digest("hex");}
export function createAdminToken(){return token();}
export function isValidAdminToken(value:string|null){if(!SECRET||!value)return false;const[payload,sig]=value.split(".");if(!payload||!sig)return false;const expected=createHmac("sha256",SECRET).update(payload).digest("hex");try{if(!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return false;}catch{return false;}const ts=Number(payload.split(".")[1]);return Number.isFinite(ts)&&Date.now()-ts<8*60*60*1000;}
export function isAdminRequest(req:NextRequest,passcode?:unknown){return checkPasscode(passcode)||isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value??null);}
