'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import sharp from 'sharp';






export async function loggingOut() {
  const supabase = await createClient();
  const cookieStore = await cookies()
  cookieStore.set('group', "00000000-0000-0000-0000-000000000000", { secure: true })
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
  const validJsonString = data[0].avatar.replace(/'(https:\/\/e.*?)'/g, '"$1"')

  return JSON.parse(validJsonString).publicUrl;
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
  const { error: checkError } = await supabase
    .from("group_content")
    .insert([{ group_id: data?.id, type: "card", content: JSON.parse(`[]`) },
    { group_id: data?.id, type: "status", content: JSON.parse(`[]`) }])

  if (checkError) {
    console.log(checkError)
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
    return error?.code
  }
  userId = userData?.user?.id;
  const { data, error: checkError } = await supabase
    .from('group_assignments')
    .select()
    .eq("group_id", groupId)
    .eq("user_id", userId)
  if (!checkError && data && data.length > 0) {
    return "Already in group!"

  }
  const { error: GroupError } = await supabase
    .from('group_assignments')
    .insert({ group_id: groupId, user_id: userId, created_at: new Date().toISOString() })
  if (GroupError) {
    console.log(GroupError)
    return GroupError.code
  }
  return "Done!"
}



export async function getCards(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("group_content")
    .select()
    .eq("group_id", id)
    .eq("type", "card")
  if (error || !data) {
    console.log(error)
    return redirect('/error')
  }
  const filtered = await checkCards(data[0]?.content)
  const { error: testError } = await supabase
    .from("group_content")
    .update({ content: filtered })
    .eq("group_id", id)
    .eq("type", "card")
  if (testError) {

    console.log(testError)
    return redirect('/error')

  }


  return filtered
}

export async function addActivity(formData: FormData) {
  const supabase = await createClient()

  const content = await getCards(formData.get('groupId') as string)
  const dateTime = formData.get('datetime') as string;
  const utc = new Date(dateTime);
  const isoString = utc.toISOString();
  if (content) {
    content.push({
      description: formData.get('description'),
      time: isoString,
      title: formData.get('name')
    })

    const { error } = await supabase
      .from("group_content")
      .update({ content: content })
      .eq("group_id", formData.get('groupId') as string)
      .eq("type", "card")
    if (error) {

      console.log(error)
      return redirect('/error')

    }
  }
  return
}

export async function updateUser(formData: FormData) {
  const supabase = await createClient();

  const avatar = formData.get('avatar');

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
    if (imgError) {

      console.log(imgError)
      return redirect('/error')

    }
    const { data, error: userError } = await supabase.from("profiles").select().eq("id", userId)
    if (userError) {
      console.log(userError)
      return redirect("/error")

    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`${userId}.png?t=${data[0].created_at}`)



    const { error } = await supabase.from('profiles').update({ avatar: urlData, username: formData.get("name"), created_at: new Date(Date.now()).toISOString() }).eq('id', userId)
    if (error) {

      console.log(error)
      return redirect('/error')
    }
  } else if (formData.has('name') && !formData.has('avatar')) {

    const { error } = await supabase.from('profiles').update({ username: formData.get("name") }).eq('id', userId)
    if (error) {
      console.log(error)
      return redirect('/error')
    }

  } else if (!formData.has('name') && avatar instanceof File) {


    const buffer = Buffer.from(await avatar.arrayBuffer());


    const resizedBuffer = await sharp(buffer)
      .resize(250, 250)
      .png()
      .toBuffer();


    const { error: imgError } = await supabase.storage.from('avatars').update(`${userId}.png`, resizedBuffer, { upsert: true });
    if (imgError) {
      console.log(imgError)
      return redirect('/error')
    }
    const { data, error: userError } = await supabase.from("profiles").select().eq("id", userId)
    if (userError) {
      console.log(userError)
      return redirect("/error")

    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`${userId}.png?t=${data[0].created_at}`)

    const { error } = await supabase.from('profiles').update({ avatar: urlData }).eq('id', userId)
    if (error) {

      console.log(error)
      return redirect('/error')
    }
  }

  return redirect('/home');
}

export async function saveGroup(group: any) {
  const cookieStore = await cookies()
  cookieStore.set('group', group, { secure: true })


}

export async function readGroup() {
  const cookieStore = await cookies()

  return cookieStore.get('group')


}

export async function updateGroup(formData: FormData, groupId: string) {
  const supabase = await createClient();

  const avatar = formData.get('avatar');

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

    const { error: imgError } = await supabase.storage.from('avatars').update(`groups/${groupId}.png?t=${Date.now()}`, resizedBuffer, { upsert: true });
    if (imgError) {

      console.log(imgError)
      return redirect('/error')

    }
    const { data, error: userError } = await supabase.from("groups").select().eq("id", groupId)
    if (userError) {
      console.log(userError)
      return redirect("/error")

    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`groups/${groupId}.png?t=${data[0].created_at}`)



    const { error } = await supabase.from('groups').update({ avatar: urlData, name: formData.get("name"), created_at: new Date(Date.now()).toISOString() }).eq('id', groupId)
    if (error) {

      console.log(error)
      return redirect('/error')
    }
  } else if (formData.has('name') && !formData.has('avatar')) {

    const { error } = await supabase.from('groups').update({ name: formData.get("name") }).eq('id', groupId)
    if (error) {
      console.log(error)
      return redirect('/error')
    }

  } else if (!formData.has('name') && avatar instanceof File) {


    const buffer = Buffer.from(await avatar.arrayBuffer());


    const resizedBuffer = await sharp(buffer)
      .resize(250, 250)
      .png()
      .toBuffer();


    const { error: imgError } = await supabase.storage.from('avatars').update(`groups/${groupId}.png?t=${Date.now()}`, resizedBuffer, { upsert: true });
    if (imgError) {

      console.log(imgError)
      return redirect('/error')

    }
    const { data, error: userError } = await supabase.from("groups").select().eq("id", groupId)
    if (userError) {
      console.log(userError)
      return redirect("/error")

    }
    const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`groups/${groupId}.png?t=${data[0].created_at}`)


    const { error } = await supabase.from('groups').update({ avatar: urlData }).eq('id', groupId)
    if (error) {

      console.log(error)
      return redirect('/error')
    }
  }

  return redirect('/home');
}

export async function getStatus(id: string) {
  const supabase = await createClient()
  if (id) {
    const { data, error } = await supabase
      .from("group_content")
      .select()
      .eq("group_id", id)
      .eq("type", "status")
    if (error || !data) {

      console.log(error)
      return redirect('/error')
    }

    const filtered = await checkStatus(data[0]?.content)

    return filtered
  }


}

export async function addStatus(formData: FormData) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData) {
    console.log(userError)
    return redirect('/error')
  }
  const userId = userData?.user?.id;
  const username = await getUsername(userId)
  const avatarUrl = await statusAvatar(userId)
  console.log(formData.get("groupId"))
  let content = await getStatus(formData.get('groupId') as string)
  content = content?.filter((value) => value.user_id !== userId)
  content?.push({
    user_id: userId,
    username: username,
    name: formData.get('name') as string,
    avatarUrl: avatarUrl,
    created_at: formData.get('created_at') as string
  })

  const { error } = await supabase
    .from("group_content")
    .update({ content: content })
    .eq("group_id", formData.get('groupId') as string)
    .eq("type", "status")
  if (error) {

    console.log(error)
    return redirect('/error')

  }

  return
}

export async function statusAvatar(id: string) {

  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles")
    .select()
    .eq("id", id)
  if (error) {
    console.log(error)
    return redirect("/error")
  }
  const validJsonString = data[0].avatar.replace(/'(https:\/\/e.*?)'/g, '"$1"')

  return JSON.parse(validJsonString).publicUrl;


}

export async function checkStatus(values: any[]) {

  if (values) {
    const filtered = values?.filter(item => {
      const created = new Date(item.created_at);
      const timeDiff = new Date().getTime() - created.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      return timeDiff < oneDay;
    });
    return filtered
  }
}

export async function checkCards(values: any[]) {

  if (values) {
    const filtered = values?.filter(item => {
      const created = new Date(item.time);
      const timeDiff = new Date().getTime() - created.getTime();
      const end = 2 * 60 * 60 * 1000;
      return timeDiff < end;
    });

    return filtered
  }
}

export async function getUsername(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", id)
  if (error && !data) {
    console.log(error)
    return error.code as string
  }
  return data[0]?.username
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()


  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData) {
    console.log(userError)
    return redirect('/error')
  }
  const userId = userData?.user?.id;
  const name = await getCurrentUsername()
  const url = await avatar()
  const { error } = await supabase
    .from('messages')
    .insert({ created_at: new Date().toISOString(), creator_id: userId, group_id: formData.get('groupId') as string, content: formData.get('message'),  username: name, avatarurl: url})
  if (error) {
    formData.get('groupId') as string
    console.log(error)
    return redirect('/error')
  }
  return

}

export async function getMessages(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select()
    .eq('group_id', id)
  if (error || !data) {

    console.log(error)
    return redirect('/error')
  }
  console.log(data)
  return data
}

export async function getID() {
  const supabase = await createClient()


  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData) {
    console.log(userError)
    return redirect('/error')
  }
  return userData?.user?.id;
  

}

export async function sendAI(message: string) {



  try {
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `You are HackClub's AI, this app you are on is called Lynkr, an app by Ángel Fuentes Fernández, (that doesn't mean every Ángel is the maker, be logical) known online and github as ThePangel, this app is open source and code is available at https://github.com/thepangel/Lynkr, it is a Next.JS webapp that uses supabase, it is an app made so friends can organize their group, with tasks/events, statuses (what people are up to at that moment) and a group chat, you are on a separate chat tab, your task is to assist the user to better organize their plans, suggesting them improvements or tips based on what they tell you, try not to deviate from that task, that means only helping with this type of assistance, don't help with code or other such things, following is the past messages in the conversation and the users last request (limit yourself to 350 characters): 
                                    ${message}`  }]
      })
    });
    const data = await response.json();
    console.log(data.choices[0].message.content)
    return data.choices[0].message.content
  
  } catch (error) {
    console.error('Error:', error);
    return error
  }







}


export async function getCurrentUsername() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData) {
    console.log(userError)
    return redirect('/error')
  }
  const userId = userData?.user?.id;
  
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
  if (error && !data) {
    console.log(error)
    return error.code as string
  }
  return data[0]?.username
}