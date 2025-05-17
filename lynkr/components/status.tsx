"use client"

import { useEffect, useState } from "react"
import { useShared } from "./contentProvider"
import { getStatus, statusAvatar } from "./actions"

export default function Status() {
    const [status, setStatus] = useState<any[]>()
    const [avatarUrl, setAvatarUrl] = useState<Record<string, string>>({})
    const { sharedValue } = useShared()


   
    useEffect(() => {
        
        
        const fetch  = async () => {
            
            const value = await getStatus(sharedValue)
            setStatus(value)
            await Promise.all(value?.map(async (valueV: any) => {
                
                console.log(valueV)
                const url = await statusAvatar(valueV?.user_id)
                setAvatarUrl(prev => ({
                    ...prev,
                    [valueV?.user_id]: url
                }));
    

            }))
        }
        fetch()
        
    }, [sharedValue])
    useEffect(() => {
  console.log(status);
}, [status]);

    return <div className="grid w-1/2 h-[14rem] grid-cols-2 ">

        {status?.map((statusV) => (
            <div key={statusV.user_id} id={statusV.user_id} className="flex h-20 w-[10rem] flex-row">
                <div className="ml-5 max-w-[2.5rem] max-h-[2.5rem] rounded-full flex-1" style={{
                    backgroundImage: avatarUrl?.[statusV.user_id]
                        ? `url(${avatarUrl?.[statusV.user_id]})`
                        : 'none',
                    backgroundColor: avatarUrl ? 'transparent' : '#FFF',
                    backgroundSize: "cover"
                }} />
                    <h1 className="pl-5 text-3xl text-white">{statusV.name}</h1>

                

            </div>



        )




        )}



    </div>
}