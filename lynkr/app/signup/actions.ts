'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'


export async function signup(formData: FormData) {
  const supabase = await createClient()

  
  
  const info = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    
  }


  let userId
  const { error: AuthError } = await supabase.auth.signUp(info)
  if (AuthError) {
    console.log(AuthError)
    return redirect('/error')
  }
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data) {
    console.log(error)
    return redirect('/error')
  }
  userId = data?.user?.id;
  
  const { error: UserError } = await supabase
    .from('profiles')
    .insert({ id: userId, username: formData.get('username') as string, created_at: new Date().toISOString()})

  
  if (UserError) {
    console.log(UserError)
    return redirect('/error')
  }


  revalidatePath('/', 'layout')
  redirect('/home')
}