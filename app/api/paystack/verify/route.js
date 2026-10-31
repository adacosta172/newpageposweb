import { NextResponse } from 'next/server';
import { validatePaystack } from '../../../../lib/paystack';
export const runtime='nodejs';
export async function GET(request){
  try {
    const reference=new URL(request.url).searchParams.get('reference')||'';
    if(!/^[a-zA-Z0-9_.\-]{6,160}$/.test(reference))return NextResponse.json({error:'Invalid reference.'},{status:400});
    const result=await validatePaystack(reference);
    return NextResponse.json(result);
  } catch(error){console.error('[paystack verify]',error.message);return NextResponse.json({error:'Payment confirmation is pending. Contact the office with your payment reference.'},{status:502});}
}
