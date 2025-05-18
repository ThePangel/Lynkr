"use client"

import { useEffect, useState } from "react"
import { useShared } from "./contentProvider"
import { getStatus, statusAvatar } from "./actions"
import ScrollContainer from "react-indiana-drag-scroll"

export default function Status() {
    const [status, setStatus] = useState<any[]>()
    const [avatarUrl, setAvatarUrl] = useState<Record<string, string>>({})
    const { sharedValue } = useShared()



    useEffect(() => {


        const fetch = async () => {

            const value = await getStatus(sharedValue)
            
            if(value) {
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
        }
        fetch()

    }, [sharedValue])
    useEffect(() => {
        console.log(status)
    }, [status]);

    return <div className="overflow-y-scroll h-[14rem] w-1/2 no-scrollbar">
        <div className="p-2 grid  grid-cols-2 auto-rows-min gap-5">
        {status?.map((statusV) => (
            <div key={statusV.created_at} id={statusV.created_at} className="flex h-full w-full flex-row justify-between"
                style={{
                    filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                }}>
                <div className=" mt-10 max-w-[2.5rem] max-h-[2.5rem] rounded-full border-2 flex-1" style={{
                    backgroundImage: avatarUrl?.[statusV.user_id]
                        ? `url(${avatarUrl?.[statusV.user_id]})`
                        : 'none',
                    backgroundColor: avatarUrl ? 'transparent' : '#FFF',
                    backgroundSize: "cover"
                }} />
                <div className="shrink ml-2 mr-1 rounded-r-lg rounded-tl-lg bg-white min-h-[5rem] w-[18rem] flex-1" style={{
                    filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))'
                }}><h1 className="m-1 text-xl text-black">{statusV.name}</h1></div>



            </div>



        )




        )}


        </div>
    </div> 
}