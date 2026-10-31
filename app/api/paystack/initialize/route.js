import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serviceClient } from '../../../../lib/paystack';
export const runtime='nodejs';
export async function POST(request){
  try {
    const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!token)return NextResponse.json({error:'Sign in to make a payment.'},{status:401});
    if(!process.env.PAYSTACK_SECRET_KEY)return NextResponse.json({error:'Online payments are not configured yet. Ask staff for MoMo or bank payment options.'},{status:503});
    const publicClient=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const {data:auth,error:authError}=await publicClient.auth.getUser(token);
    if(authError||!auth.user)return NextResponse.json({error:'Your session has expired.'},{status:401});
    const {order_id}=await request.json();
    if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(String(order_id)))return NextResponse.json({error:'Invalid order.'},{status:400});
    const db=serviceClient();
    const {data:profile}=await db.from('profiles').select('role,active,email').eq('id',auth.user.id).single();
    if(!profile?.active)return NextResponse.json({error:'Account is disabled.'},{status:403});
    const {data:order}=await db.from('orders').select('id,customer_id,order_no,total,status').eq('id',order_id).single();
    if(!order||(profile.role==='customer'&&order.customer_id!==auth.user.id))return NextResponse.json({error:'Order not found.'},{status:404});
    if(['cancelled','rejected'].includes(order.status))return NextResponse.json({error:'This order cannot be paid.'},{status:400});
    const {data:payments}=await db.from('payments').select('amount').eq('order_id',order.id).eq('status','confirmed');
    const due=Math.round((Number(order.total)-(payments||[]).reduce((s,p)=>s+Number(p.amount),0))*100);
    if(due<=0)return NextResponse.json({error:'This order has no outstanding quoted balance.'},{status:400});
    const origin=process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const response=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:'Bearer '+process.env.PAYSTACK_SECRET_KEY,'Content-Type':'application/json'},body:JSON.stringify({email:auth.user.email,amount:due,currency:'GHS',callback_url:origin+'/',metadata:{order_id:order.id}}),cache:'no-store'});
    const result=await response.json();
    if(!response.ok||!result.status)throw new Error(result.message||'Paystack initialization failed');
    return NextResponse.json({authorization_url:result.data.authorization_url});
  } catch(error){ console.error('[paystack initialize]',error.message);return NextResponse.json({error:'Payment setup could not be completed.'},{status:500}); }
}
