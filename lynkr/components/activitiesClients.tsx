"use client"
import { GetContent } from "./actions";
import { useShared } from "./contentProvider"
import { useState, useEffect } from "react";
import ScrollContainer from 'react-indiana-drag-scroll'


export default function Activities() {
    const { sharedValue } = useShared();
    const [content, setContent] = useState<any[]>([])
    const [countdowns, setCountdowns] = useState<Record<string, string>>({});



    useEffect(() => {
        console.log(sharedValue)
        async function fetch() {
            const data = await GetContent(sharedValue)
            if (data) {
                console.log(data)

                return setContent(data)
            }
            return;
        }
        fetch()
    }, [sharedValue])

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
        if (!content[0]?.content?.cards) return;

        const interval = setInterval(() => {
            const newCountdowns: Record<string, string> = {};
            content[0].content.cards.forEach((card: any) => {
                if (!card.solo) {
                    newCountdowns[card.title] = formatCountdown(card.time);
                }
            });
            setCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(interval);
    }, [content]);

    return <ScrollContainer vertical={false}
        className=" scroll-container flex flex-row items-center  justify-items-start h-[27rem]  bg-[#161616
        type: 'card',] overflow-x-auto overflow-y-hidden no-scrollbar"
        style={{ width: 'calc(100vw - 5rem)' }} >
        {content[0]?.content?.cards.map((card: any) => !card.solo && (


            <div key={card.title}
                className='flex flex-col items-start w-[20rem] h-[25rem] rounded-xl bg-[#464646] p-5 m-5 flex-shrink-0' style={{
                    backgroundColor: '#161616',
                    filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                }}
            >
                <h1 className="text-white font-mono text-5xl">
                    {card.title}
                </h1>
                <h3 className="mt-5 text-white font-mono text-2xl">
                    {card.description}
                </h3>
                <h2 className="mt-5 text-white font-mono text-2xl">
                    {new Date(card.time).toLocaleString()}
                </h2>
                <h2 className="mt-5 text-white font-mono text-3xl">
                    {countdowns[card.title] ?? "Loading..."}
                </h2>

            </div>

        ))

        }
    </ScrollContainer>

}