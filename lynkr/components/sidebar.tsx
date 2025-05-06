"use client"
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loggingOut } from './actions'
import { LogOut } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';



export default function SideBar() {
    const [groups, setGroups] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchGroups = async () => {

            const supabase = createClient();
            

            let finalGroups: any[] = [];
            const { data, error } = await supabase.auth.getUser()
            if (error || !data?.user) {
                router.push('/login');
                return;
            }

            const userId = data.user.id
            if (data.user) {


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


        <section className="h-screen max-w-20 bg-[#161616] flex flex-col items-center">
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

            <hr className='w-[3.5rem] border-3' />

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
            <Tooltip title="LogOut">
                <LogOut className="cursor-pointer mt-auto pb-5 size-10 text-white"onClick={loggingOut} />
            </Tooltip>
        </section>


    </div>

}