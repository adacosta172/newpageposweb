import { createClient } from '@supabase/supabase-js';
export function serviceClient(){
  if(!process.env.SUPABASE_SECRET_KEY||!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Supabase backend is not configured');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function validatePaystack(reference){
  if(!process.env.PAYSTACK_SECRET_KEY) throw new Error('Online payments have not been enabled');
  const response=await fetch('https://api.paystack.co/transaction/verify/'+encodeURIComponent(reference),{headers:{Authorization:'Bearer '+process.env.PAYSTACK_SECRET_KEY},cache:'no-store'});
  if(!response.ok) throw new Error('Could not verify payment with Paystack');
  const body=await response.json();
  if(!body.status||!body.data||body.data.status!=='success')return {paid:false};
  const data=body.data;
  if(data.currency!=='GHS'||!data.metadata?.order_id||!Number.isInteger(data.amount)||data.amount<1) throw new Error('Invalid verified payment details');
  const db=serviceClient();
  const {data:order,error}=await db.from('orders').select('id,total,customer_id').eq('id',data.metadata.order_id).single();
  if(error||!order)throw new Error('Order was not found');
  const amount=Number((data.amount/100).toFixed(2));
  const {data:existing,error:existsError}=await db.from('payments').select('id,amount').eq('reference',reference).maybeSingle();
  if(existsError)throw existsError;
  if(existing)return {paid:true,duplicate:true,orderId:order.id,amount:existing.amount};
  const {data:payments,error:paymentsError}=await db.from('payments').select('amount').eq('order_id',order.id).eq('status','confirmed');
  if(paymentsError)throw paymentsError;
  const outstanding=Number(order.total)-payments.reduce((sum,p)=>sum+Number(p.amount),0);
  if(amount>outstanding+0.009)throw new Error('Verified transaction exceeds order balance; manual reconciliation required');
  const {error:saveError}=await db.from('payments').insert({order_id:order.id,amount,method:'paystack',status:'confirmed',reference,recorded_by:null});
  if(saveError){
    if(saveError.code==='23505')return {paid:true,duplicate:true,orderId:order.id,amount};
    throw saveError;
  }
  return {paid:true,orderId:order.id,amount};
}
