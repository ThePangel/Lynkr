"use server"
import { createClient } from '@/utils/supabase/server'

export default async function getGroup(groupId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.from('groups')
    .select()
    .eq("id", groupId)
    if (error) {
        console.log(error)
        return error
    }
    return data[0]?.name
}