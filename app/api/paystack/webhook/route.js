import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { validatePaystack } from '../../../../lib/paystack';
export const runtime='nodejs';
export async function POST(request){
  if(!process.env.PAYSTACK_SECRET_KEY)return NextResponse.json({error:'Not configured'},{status:503});
  const raw=await request.text();
  const signature=request.headers.get('x-paystack-signature')||'';
  const expected=createHmac('sha512',process.env.PAYSTACK_SECRET_KEY).update(raw).digest('hex');
  if(signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return NextResponse.json({error:'Invalid signature'},{status:401});
  try {
    const event=JSON.parse(raw);
    if(event.event==='charge.success'&&event.data?.reference){
      await validatePaystack(event.data.reference);
    }
    return NextResponse.json({ok:true});
  } catch(error){ console.error('[paystack webhook]',error.message);return NextResponse.json({error:'Temporary verification error'},{status:500}); }
}
