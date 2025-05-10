'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'




export async function loggingOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/home')
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

  return (data[0].avatar)

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
  let groupId = Number(formData.get('code') as string)
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData) {
    console.log("User")
    console.log(error)
    return redirect('/error')
  }
  userId = userData?.user?.id;

  const { error: GroupError } = await supabase
    .from('group_assignments')
    .insert({ group_id: groupId, user_id: userId, created_at: new Date().toISOString() })
  if (GroupError) {
    console.log("Group")
    console.log(GroupError)
    return redirect('/error')
  }
  return redirect('/home');
}

export async function GetContent(id: number) {
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
  
  const input = formData.get('datetime') as string
  
  console.log("JODER")
  console.log(formData.get('groupId'))
  const localDate = new Date(input);
  const tzOffsetMinutes = localDate.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(tzOffsetMinutes) / 60);
  const offsetMinutes = Math.abs(tzOffsetMinutes) % 60;
  const sign = tzOffsetMinutes <= 0 ? '+' : '-';
  const tzString = sign +
  String(offsetHours).padStart(2, '0') + ':' +
  String(offsetMinutes).padStart(2, '0');

  const isoLocal = localDate.toISOString().slice(0, -1);
  const finalTime = isoLocal + tzString;

  const content = await GetContent(parseInt(formData.get('groupId') as string))

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
  if(error){

    console.log(error)
    return redirect('/error')

  }
  console.log(content[0]?.content?.cards)
  return redirect('/home')
}