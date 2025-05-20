"use client"

import { useEffect, useState } from "react"
import { useShared } from "./contentProvider"
import { getStatus, getUsername, statusAvatar } from "./actions"
import { createClient } from '@/utils/supabase/client'

export default function Status() {
    const [status, setStatus] = useState<any[]>()
    const [avatarUrl, setAvatarUrl] = useState<Record<string, string>>({})
    const { sharedValue } = useShared()



    useEffect(() => {

        let subscription: any = null
        const fetch = async () => {
            const supabase = await createClient()
            await supabase.realtime.setAuth()
            const value = await getStatus(sharedValue)
            if (value) {
                const status = await Promise.all(value?.map(async (valueV: any) => {

                    const username = await getUsername(valueV?.user_id)
                    const url = await statusAvatar(valueV?.user_id)

                    setAvatarUrl(prev => ({
                        ...prev,
                        [valueV?.user_id]: url
                    }));
                    return {
                        ...valueV,
                        username
                    }

                }))
                setStatus(status)
                
            }

            subscription = await supabase
                .channel(`group_id_status:${sharedValue}`)
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'group_content',
                        filter: `group_id=eq.${sharedValue}`
                    },
                    async (payload) => {
                      
                        if (payload.new?.type === "status") {
                            
                            const status = await Promise.all(payload.new?.content?.map(async (valueV: any) => {

                                const username = await getUsername(valueV?.user_id)
                                const url = await statusAvatar(valueV?.user_id)

                                setAvatarUrl(prev => ({
                                    ...prev,
                                    [valueV?.user_id]: url
                                }));
                                return {
                                    ...valueV,
                                    username
                                }

                            }))
                            setStatus(status)


                        }
                    }
                )
                .subscribe()
           

        }
        fetch()
        return () => {
           
            if (subscription) {
                subscription.unsubscribe();
                
            }
        }




    }, [sharedValue])


    return <div className="overflow-y-scroll h-[25rem] w-1/2 no-scrollbar">
        <div className="p-2 grid  grid-cols-2 auto-rows-min gap-5">
            {status?.map((statusV) => (
                <div key={statusV.created_at} id={statusV.created_at} className="flex h-full w-full flex-row justify-between"
                    style={{
                        filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                    }}>
                    <div className="mt-7 flex flex-col justify-items-center ">
                        <p className="mr-3 mb-2 inline-block font-mono text-white"
                            style={{
                                filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                            }}>
                            {statusV.username}</p>
                        <div className="max-w-[2.5rem] min-w-[2.5rem] min-h-[2.5rem] max-h-[2.5rem] rounded-full border-2 flex-1" style={{
                            backgroundImage: avatarUrl?.[statusV.user_id]
                                ? `url(${avatarUrl?.[statusV.user_id]})`
                                : 'none',
                            backgroundColor: avatarUrl ? 'transparent' : '#FFF',
                            backgroundSize: "cover"
                        }} />

                    </div>

                    <div className="shrink ml-2 mr-1 rounded-r-lg rounded-tl-lg bg-white min-h-[5rem] w-[18rem] flex-1" style={{
                        filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))'
                    }}><h1 className="m-1 text-xl text-black font-mono ">{statusV.name}</h1></div>



                </div>



            )




            )}


        </div>
    </div>
}