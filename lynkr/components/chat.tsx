'use client'
import { useRef, useEffect, useReducer, useState, SyntheticEvent, use } from "react";
import { useShared } from "./contentProvider";
import { getMessages, sendMessage, getUsername, statusAvatar, getID, sendAI, getCurrentUsername, avatar } from "./actions";
import { createClient } from '@/utils/supabase/client'
import Tab from '@mui/material/Tab';
import { TabContext, TabList, TabPanel } from '@mui/lab'

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
    switch (action[0]?.type) {
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
    const [value, setValue] = useState('1');
    const [AIchat, setChat] = useState<any[]>([])
    const [cUsersName, setName] = useState<string[]>([])
    const [AIuserChat, setUserChat] = useState("This is just a message telling you to initiate the conversation")
    const handleChange = (event: SyntheticEvent, newValue: string) => {
        setValue(newValue);
        console.log(newValue)
    };
    const handleSubmitGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        const form = formRef.current;
        if (!form) return;

        if (value === "1") {
            let formData = new FormData(form);

            await sendMessage(formData)
        } else if (value === "2") {
            const message = new FormData(form).get('message') as string
            setUserChat(message)
            setChat(prev => [...prev,
                message
            ])

        }
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
                const creator = await getID()
                let isCreator: boolean
                const wUser: Action[] = await Promise.all(
                    value.map(async (valueV) => {
                        if (creator === valueV.creator_id) isCreator = true
                        else isCreator = false
                        return {
                            type: "update",
                            group_id: valueV.group_id,
                            creator_id: valueV.creator_id,
                            created_at: valueV.created_at,
                            content: valueV.content,
                            username: valueV.username,
                            avatarUrl: valueV.avatarurl,
                            isCreator: isCreator,
                        };
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
                            const creator = await getID()
                            let isCreator: boolean

                            if (creator === payload.new?.creator_id) isCreator = true
                            else isCreator = false

                            const wUser: Action[] = [{
                                type: "update",
                                group_id: payload.new.group_id,
                                creator_id: payload.new.creator_id,
                                created_at: payload.new.created_at,
                                content: payload.new.content,
                                username: payload.new.username,
                                avatarUrl: payload.new.avatarurl,
                                isCreator: isCreator,
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

    }, [state, value, AIchat]);
    useEffect(() => {
        const ai = async () => {
            const message = await sendAI(`Past conversation: ${AIchat.join(";")}, lastest request: ${AIuserChat}, current time :${new Date().toLocaleString()}`)
            setChat(prev => [...prev,
                message
            ])
        }
        ai()
        console.log(AIuserChat)
        console.log(AIchat)
    }, [AIuserChat])

    useEffect(() => {
        const name = async () => {
            const name = await getCurrentUsername()
            const url = await avatar()
            setName(prev => [
                ...prev,
                name,
                url
            ])

        }
        name()

    }, [])

    return <div className="flex flex-col-reverse h-[25rem] w-1/2 rounded-lg border-2">
        <TabContext value={value}>
            <div className="h-[3.5rem] bg-slate-50 "> <form onSubmit={handleSubmitGroup} ref={formRef}>
                <input id="message" name="message" type="text" required className='mt-3 mx-3 rounded-md bg-black border-1 w-[97%] h-[2rem] text-white  font-mono' />
                <input type="hidden" name="groupId" value={sharedValue} />
                <button type="submit" hidden />
            </form> </div>

            <div ref={scrollRef} className="h-[21.5rem] overflow-y-auto no-scrollbar">

                <TabPanel value="1">
                    <div className={`p-2 flex flex-col gap-2 `} tabIndex={0}>
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
                </TabPanel>
                <TabPanel value="2">
                    <div className={`p-2 flex flex-col gap-2 `}>
                        {AIchat?.map((message, index) => {

                            let user: boolean = false
                            let name: string = "HackClubAI"
                            let url: string = "https://assets.hackclub.com/icon-square.png"
                            if (index % 2 !== 0) {
                                user = true
                                name = cUsersName[0]
                                url = cUsersName[1]
                            }
                            return (
                                <div key={message} id={message} className={`flex ${user ? 'justify-start ml-full flex-row-reverse' : 'justify-start mr-full flex-row'}    `}
                                    style={{
                                        filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                                    }}>
                                    <div className={` flex flex-col justify-items-center items-center`}>
                                        <p className=" mb-2 mr-2 inline-block font-mono text-white"
                                            style={{
                                                filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))'
                                            }}>
                                            {name}</p>
                                        <div className="max-w-[2.5rem] min-w-[2.5rem] min-h-[2.5rem] max-h-[2.5rem] rounded-full border-2 flex-1" style={{
                                            backgroundImage: url
                                                ? `url(${url})`
                                                : 'none',
                                            backgroundColor: url ? 'transparent' : '#FFF',
                                            backgroundSize: "cover"
                                        }} />
                                    </div>
                                    <div className={`self-end  shrink  rounded-r-lg rounded-tl-lg bg-white min-h-[2rem] min-w-5 max-w-[50%] inline-block mr-1`} style={{
                                        filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))'
                                    }}><h1 className="m-1 text-xl text-black font-mono inline-block">{message}</h1></div>
                                </div>
                            )
                        })}
                    </div>
                </TabPanel>


            </div>
            <TabList className="bg-white" onChange={handleChange}>
                <Tab sx={{
                    color: 'black',
                    '&.Mui-selected': {
                        color: 'grey',
                    },
                }} label="Group Chat" value="1" />
                <Tab sx={{
                    color: 'black',
                    '&.Mui-selected': {
                        color: 'grey',
                    },
                }} label="AI" value="2" /></TabList>
        </TabContext>
    </div>
}       
