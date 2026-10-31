import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serviceClient } from '../../../../lib/paystack';
export const runtime='nodejs';
export async function POST(request){
  try{
    const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!token)return NextResponse.json({error:'Please sign in.'},{status:401});
    const pub=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const {data:auth,error:authError}=await pub.auth.getUser(token);
    if(authError||!auth.user)return NextResponse.json({error:'Session expired.'},{status:401});
    const db=serviceClient();
    const {data:caller}=await db.from('profiles').select('role,active').eq('id',auth.user.id).single();
    if(!caller?.active||caller.role!=='admin')return NextResponse.json({error:'Only the owner may invite staff.'},{status:403});
    const {email,full_name}=await request.json();
    if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||email.length>200)return NextResponse.json({error:'Enter a valid email.'},{status:400});
    const name=String(full_name||'').trim().slice(0,140);
    if(name.length<2)return NextResponse.json({error:'Enter the staff member name.'},{status:400});
    const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const {data,error}=await db.auth.admin.inviteUserByEmail(email,{data:{full_name:name},redirectTo:siteUrl});
    if(error)return NextResponse.json({error:error.message},{status:400});
    const id=data?.user?.id;
    if(!id)throw new Error('Invitation succeeded without user identifier');
    const {error:updateError}=await db.from('profiles').update({role:'staff',full_name:name}).eq('id',id);
    if(updateError)throw updateError;
    return NextResponse.json({ok:true});
  }catch(error){console.error('[team invite]',error.message);return NextResponse.json({error:'Could not send staff invitation. Check Supabase email settings.'},{status:500});}
}
