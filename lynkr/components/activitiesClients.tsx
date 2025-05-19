"use client"
import { createClient } from '@/utils/supabase/client'
import { getCards } from "./actions";
import { useShared } from "./contentProvider"
import { useState, useEffect } from "react";
import ScrollContainer from 'react-indiana-drag-scroll'



export default function Activities() {
    const { sharedValue } = useShared();
    const [content, setContent] = useState<any[]>([])
    const [countdowns, setCountdowns] = useState<Record<string, string>>({});



    useEffect(() => {
        console.log(sharedValue)
        let subscription: any = null

        async function fetch() {
            const supabase = await createClient()
            await supabase.realtime.setAuth()
            const data = await getCards(sharedValue)
            if (data) {
                console.log(data)

                setContent(data)
            }
            subscription = await supabase
                .channel(`group_id_cards:${sharedValue}`)
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'group_content',
                        filter: `group_id=eq.${sharedValue}`
                    },
                    async (payload) => {
                        console.log(`broooo ${payload.new?.type}`)
                        if (payload.new?.type === "card") {

                            setContent(payload.new?.content)


                        }
                    }
                )
                .subscribe()
            console.log(subscription)


        }
        fetch()
        return () => {
            console.log(subscription)
            if (subscription) {
                subscription.unsubscribe();
                console.log('Unsubscribed from realtime updates');
            }
        }
    }, [sharedValue])
    useEffect(() => {
        console.log(content)
    }, [content])

    function formatCountdown(targetTime: string) {
        const now = new Date().getTime();
        const future = new Date(targetTime).getTime();
        const diff = future - now;

        if (diff <= 0) return "00:00:00";

        const totalSeconds = Math.floor(diff / 1000);
        const days = String(Math.floor(totalSeconds / 86400)).padStart(2, "0");
        const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${days} days ${hours}:${minutes}:${seconds}`;
    }
    useEffect(() => {
        if (!content) return;

        const interval = setInterval(() => {
            const newCountdowns: Record<string, string> = {};
            content.forEach((card: any) => {
                if (!card.solo) {
                    newCountdowns[card.title] = formatCountdown(card.time);
                }
            });
            setCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(interval);
    }, [content]);

    return <ScrollContainer vertical={false}
        className=" scroll-container flex flex-row items-center  justify-items-start h-[20rem]  bg-[#161616
        type: 'card',] overflow-x-auto overflow-y-hidden no-scrollbar"
        style={{ width: 'calc(100vw - 5rem)' }} >
        {content?.map((card: any) => !card.solo && (


            <div key={card.time}
                className='flex flex-col items-start w-[20rem] h-[19rem] rounded-xl bg-[#464646] p-5 m-5 flex-shrink-0' style={{
                    backgroundColor: '#161616',
                    filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                }}
            >
                <h1 className="text-white font-mono text-4xl">
                    {card.title}
                </h1>
                <h3 className="mt-5 text-white font-mono text-2xl">
                    {card.description}
                </h3>
                <h2 className="mt-5 text-white font-mono text-2xl">
                    {new Date(card.time).toLocaleString(undefined, {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    })}
                </h2>
                <h2 className="mt-5 text-white font-mono text-3xl">
                    {countdowns[card.title] ?? "Loading..."}
                </h2>

            </div>

        ))

        }
    </ScrollContainer>

}