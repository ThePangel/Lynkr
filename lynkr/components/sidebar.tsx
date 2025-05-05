import { createClient } from '@/utils/supabase/client';
import { DatabaseSync } from 'node:sqlite';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation'


export default function SideBar() {
    const [groups, setGroups] = useState<any[]>([]);

    async function PrivatePage() {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
            redirect('/login')
        }

    }

    useEffect(() => {
        const fetchGroups = async () => {
            await PrivatePage()
            const supabase = createClient();
            let finalGroups: any[] = [];
            const { data: sessionData } = await supabase.auth.getUser();

            if (sessionData.user) {
                
                const userId = sessionData.user.id
                console.log(userId  )
                const { data } = await supabase
                    .from("group_assignments")
                    .select()
                    //.eq("user_id", userId);
                console.log(data)

                if (data) {
                    await Promise.all(
                        data.map(async (groups) => {
                            let groupId = groups.group_id;
                            const { data: group } = await supabase
                                .from("groups")
                                .select()
                                .eq("id", groupId);
                            if (group) {
                                finalGroups.push(group[0])
                            }
                        })
                    )
                }
            }


            console.log(finalGroups[0].name);
            setGroups(finalGroups ?? []);

        };

        fetchGroups();
    }, []);

    return <div >


        <section className="h-screen max-w-20 bg-black">
            {groups.map((group) => (

                <div key={group.id} className='text-white'>{group.name}</div>
            ))


            }


        </section>


    </div>

}