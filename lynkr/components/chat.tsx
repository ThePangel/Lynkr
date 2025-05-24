'use client'
import { useRef, useEffect, useReducer, useState } from "react";
import { useShared } from "./contentProvider";
import { getMessages, sendMessage, getUsername, statusAvatar, avatar, checkCreator } from "./actions";
import { createClient } from '@/utils/supabase/client'

type Action = {
    type: string
    group_id: string,
    creator_id: string,
    created_at: string
    content: string,
    username: string,
    avatarUrl: string,
    isCreator: boolean

}


function tasksReducer(state: any[], action: Action[] | { type: "clear" }) {
    if (!Array.isArray(action)) {

        if (action.type === "clear") {
            return [];
        }
        return state;
    }
    switch (action[0].type) {
        case "update": {
            return [
                ...state,
                ...action
            ]
        }
        default:
            return state

    }
}

export default function Chat() {
    const formRef = useRef<HTMLFormElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { sharedValue } = useShared()
    const [state, dispatch] = useReducer(tasksReducer, []);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const form = formRef.current;
        if (!form) return;


        let formData = new FormData(form);

        await sendMessage(formData)


        form.reset()

    }

    const handleGetUpdate = (value: Action[]) => {
        dispatch(
            value
        )

    }


    useEffect(() => {
        dispatch({ type: "clear" });
        let subscription: any = null;
        const fetch = async () => {
            const supabase = await createClient();
            await supabase.realtime.setAuth();

            const value = await getMessages(sharedValue);
            if (value) {
                let wUser: Action[] = []
                await Promise.all(
                    value?.map(async (valueV: any) => {
                        const avatarUrl = await statusAvatar(valueV?.creator_id)
                        const username = await getUsername(valueV?.creator_id);
                        const creator = await checkCreator(valueV?.creator_id)

                        wUser.push({
                            type: "update",
                            group_id: valueV?.group_id,
                            creator_id: valueV?.creator_id,
                            created_at: valueV?.created_at,
                            content: valueV?.content,
                            username: username,
                            avatarUrl: avatarUrl,
                            isCreator: creator
                        })
                        

                    })
                    
                );
                handleGetUpdate(wUser);

            }

            subscription = await supabase
                .channel(`group_id_messages:${sharedValue}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `group_id=eq.${sharedValue}`
                    },
                    async (payload) => {
                        if (typeof payload.new?.content === "string") {


                            const avatarUrl = await statusAvatar(payload.new?.creator_id)
                            const username = await getUsername(payload.new?.creator_id)
                            const creator = await checkCreator(payload.new?.creator_id)

                            const wUser: Action[] = [{
                                type: "update",
                                group_id: payload.new.group_id,
                                creator_id: payload.new.creator_id,
                                created_at: payload.new.created_at,
                                content: payload.new.content,
                                username: username,
                                avatarUrl: avatarUrl,
                                isCreator: creator
                            }]
                            handleGetUpdate(wUser);





                        }
                    }
                )
                .subscribe();


        };

        fetch();

        return () => {

            if (subscription) {
                subscription.unsubscribe();

            }
        };
    }, [sharedValue]);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
        
    }, [state]);

    return <div className="flex flex-col-reverse h-[25rem] w-1/2 rounded-lg border-2">
        <div className="h-[3.5rem] bg-slate-50 "> <form onSubmit={handleSubmit} ref={formRef}>
            <input id="message" name="message" type="text" required className='mt-3 mx-3 rounded-md bg-black border-1 w-[97%] h-[2rem] text-white  font-mono' />
            <input type="hidden" name="groupId" value={sharedValue} />
            <button type="submit" hidden />
        </form> </div>
        <div ref={scrollRef} className="h-[21.5rem] overflow-y-auto">
            <div className={`p-2 flex flex-col gap-2 `}>
                {state?.map((message, index) => {
                    const previous = state[index - 1]
                    return (
                        <div key={message.id} id={message.id} className={`flex ${message.isCreator ? 'justify-start ml-full flex-row-reverse' : 'justify-start mr-full flex-row'}    `}
                            style={{
                                filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                            }}>
                            <div className={` flex flex-col justify-items-center items-center ${previous?.creator_id === message.creator_id ? 'invisible h-0' : 'mt-7'} `}>
                                <p className=" mb-2 inline-block font-mono text-white"
                                    style={{
                                        filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                                    }}>
                                    {message.username}</p>
                                <div className="max-w-[2.5rem] min-w-[2.5rem] min-h-[2.5rem] max-h-[2.5rem] rounded-full border-2 flex-1" style={{
                                    backgroundImage: message.avatarUrl
                                        ? `url(${message.avatarUrl})`
                                        : 'none',
                                    backgroundColor: message.avatarUrl ? 'transparent' : '#FFF',
                                    backgroundSize: "cover"
                                }} />
                            </div>
                            <div className={`self-end  shrink  rounded-r-lg rounded-tl-lg bg-white min-h-[2rem] min-w-5 max-w-[50%] inline-block mr-1`} style={{
                                filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))'
                            }}><h1 className="m-1 text-xl text-black font-mono inline-block">{message.content}</h1></div>
                        </div>
                    )


                })}
            </div>

        </div>


    </div>
}       
