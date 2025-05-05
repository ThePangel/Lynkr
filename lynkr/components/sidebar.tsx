import { createClient } from '@/utils/supabase/client';
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
                console.log(userId)
                const { data } = await supabase
                    .from("group_assignments")
                    .select()
                    .eq("user_id", userId);
                

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


            console.log(finalGroups);
            setGroups(finalGroups ?? []);

        };

        fetchGroups();
    }, []);

    return <div >


        <section className="h-screen max-w-20 bg-black flex flex-col items-center">
            {groups.map((group) => group.solo && (
                
                <div key={group.id} 
                className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                    backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                    backgroundColor: group.avatar ? 'transparent' : '#FFF', 
                    backgroundSize: "cover"
                  }}>
                    <p>
                        {group.name}
                    </p>
                </div>
            ))


            }

            <hr className='w-[3.5rem] border-3'/>

            {groups.map((group) => !group.solo && (
                
                <div key={group.id} 
                className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                    backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                    backgroundColor: group.avatar ? 'transparent' : '#FFF', 
                    backgroundSize: "cover"
                  }}>
                    <p>
                        {group.name}
                    </p>
                </div>
            ))

        }
        </section>


    </div>

}