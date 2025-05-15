'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import sharp from 'sharp';
import { Console } from 'console'




export async function loggingOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return redirect('/error')
  }

  revalidatePath('/', 'layout')
  return redirect('/home')
}

export async function avatar() {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData) {
    console.log(authError)
    return redirect('/error')
  }
  const userId = authData.user.id

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId);
  if (error || !data) {
    console.log(error)  
    return redirect('/error')
  }
  console.log(JSON.parse(data[0].avatar).publicUrl)
  return (JSON.parse(data[0].avatar).publicUrl)

}

export async function fetchGroups() {
  const supabase = await createClient();


  let finalGroups: any[] = [];
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log(error)
    return redirect('/login')
  }

  const userId = data.user.id
  if (data.user) {


    console.log(userId)
    const { data } = await supabase
      .from("group_assignments")
      .select()
      .eq("user_id", userId);



    if (data) {
      
      await Promise.all(data.map(async (groups) => {
        let groupId = groups.group_id;
        const { data: group } = await supabase
          .from("groups")
          .select()
          .eq("id", groupId);
        if (group) {

          finalGroups.push(group[0])
        }
      }))

    }
  }

  
  return (finalGroups)

}

export async function newGroup(formData: FormData) {
  const supabase = await createClient()

  const { data, error: GroupError } = await supabase
    .from('groups')
    .insert({ name: formData.get('name') as string, solo: formData.get('solo') === 'on', created_at: new Date().toISOString() })
    .select()
    .single()

  if (!data || GroupError) {
    console.log(GroupError)
    return redirect('/error')
  }
  let userId
  let groupId
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData) {
    console.log(error)
    return redirect('/error')
  }
  userId = userData?.user?.id;
  groupId = data?.id;
  const { error: asignmentError } = await supabase
    .from('group_assignments')
    .insert({ group_id: data?.id, user_id: userId, created_at: new Date().toISOString() })
  if (asignmentError) {
    console.log(asignmentError)
    return redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient()
  let userId
  let groupId = formData.get('code') as string
  
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData) {
    console.log(error)
    return error
  }
  userId = userData?.user?.id;
  const { data, error: checkError } = await supabase
    .from('group_assignments')
    .select()
    .eq("group_id", groupId)
    .eq("user_id", userId)
  if(!checkError && data && data.length > 0){
    return "Already in group!"

  }
  const { error: GroupError } = await supabase
    .from('group_assignments')
    .insert({ group_id: groupId, user_id: userId, created_at: new Date().toISOString() })
  if (GroupError) {
    console.log(GroupError)
    return GroupError 
  }
  return "Done!"
}

export async function GetContent(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("group_content")
    .select()
    .eq("group_id", id)
  if (error || !data) {
    console.log("User")
    console.log(error)
    return redirect('/error')
  }


  //console.log(data)

  return data
}

export async function addActivity(formData: FormData) {
  const supabase = await createClient()


  const input = formData.get('datetime') as string;
  const localDate = new Date(input);
  const tzOffsetMinutes = localDate.getTimezoneOffset();
  const sign = tzOffsetMinutes < 0 ? '+' : '-';
  const offsetHours = Math.abs(Math.floor(tzOffsetMinutes / 60));
  const offsetMinutes = Math.abs(tzOffsetMinutes % 60);
  const tzString = sign + String(offsetHours).padStart(2, '0') + ':' + String(offsetMinutes).padStart(2, '0');
  const finalTime = input + tzString;


  const content = await GetContent(formData.get('groupId') as string)

  content[0]?.content?.cards.push({
    description: formData.get('description'),
    time: finalTime,
    title: formData.get('name')
  })

  const { error } = await supabase
    .from("group_content")
    .update({ content: content[0]?.content })
    .eq("group_id", parseInt(formData.get('groupId') as string))
    .eq("type", "card")
  if (error) {

    console.log(error)
    return redirect('/error')

  }

  return redirect('/home')
}

export async function updateUser(formData: FormData) {
  const supabase = await createClient();

  const avatar = formData.get('avatar');
  console.log(avatar)
  console.log(formData.has('name'))
  console.log(formData.has('avatar'))

  let userId
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData) {
    console.log(error)
    return redirect('/error')
  }
  userId = userData?.user?.id;

  if (
    (avatar instanceof File &&
    (avatar.type === 'image/jpeg' || avatar.type === 'image/png')) 
    && formData.has('name')
  ) {
    
    const buffer = Buffer.from(await avatar.arrayBuffer());

  
    const resizedBuffer = await sharp(buffer)
    .resize(250, 250)
    .png()
    .toBuffer();
    
    const { error: imgError } = await supabase.storage.from('avatars').update(`${userId}.png?t=${Date.now()}`, resizedBuffer, { upsert: true });
    if(imgError){
      console.log("gang")
      console.log(imgError)
      return redirect('/error')

    }
    const {data, error: userError} = await supabase.from("profiles").select().eq("id", userId)
    if(userError){
      console.log(userError)
      return redirect("/error")

    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`${userId}.png?t=${data[0].created_at}`)



    const { error } = await supabase.from('profiles').update({ avatar: urlData, created_at: new Date(Date.now()).toISOString() }).eq('id', userId)
    if(error) {
      console.log("error")
      console.log(error)
      return redirect('/error')
    }
  } else if(formData.has('name') && !formData.has('avatar')) {
    console.log("gang")
    const { error } = await supabase.from('profiles').update({ username: formData.get("name") }).eq('id', userId)
    if(error) {
      console.log(error)
      return redirect('/error')
    }

  } else if(!formData.has('name') && avatar instanceof File) {
    
    
    const buffer = Buffer.from(await avatar.arrayBuffer());

  
    const resizedBuffer = await sharp(buffer)
    .resize(250, 250)
    .png()
    .toBuffer();
    
    
    const { error: imgError } = await supabase.storage.from('avatars').update(`${userId}.png`, resizedBuffer, { upsert: true });
    if(imgError){
      console.log(imgError)
      return redirect('/error')
    }
    const {data, error: userError} = await supabase.from("profiles").select().eq("id", userId)
    if(userError){
      console.log(userError)
      return redirect("/error")

    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`${userId}.png?t=${data[0].created_at}`)

    const { error } = await supabase.from('profiles').update({ avatar: urlData, username: formData.get("name") }).eq('id', userId)
    if(error) {
       
      console.log(error)
      return redirect('/error')
    }
  }

  return redirect('/home');
  }

export async function saveGroup(group: any) {
  const cookieStore = await cookies()
  cookieStore.set('group', group, {secure: true})
    
  
}

export async function readGroup() {
  const cookieStore = await cookies()
  
  return cookieStore.get('group')
  
  
}