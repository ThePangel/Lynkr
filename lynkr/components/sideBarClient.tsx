"use client"

import { Plus } from 'lucide-react';
import Modal from '@mui/material/Modal';
import NewGroupModal from './nGroupModal';
import { useState, useEffect } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll'
import { useShared } from './contentProvider';
import { fetchGroups, readGroup, saveGroup } from './actions';


export default function SideBarClient() {
    const { setSharedValue, sharedValue } = useShared();
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState<any[]>()
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
     useEffect(() => {
            const fGroups = async () => {
                const values = await fetchGroups()
                setGroups(values)
                console.log(groups)
            }
            fGroups()
            console.log(groups)
    }, []) 
    useEffect(() => {
        console.log(sharedValue)
        const save = async () => {
            
            if(sharedValue === "00000000-0000-0000-0000-000000000000") {
                const value = await readGroup()
                setSharedValue(value?.value)
                console.log(sharedValue)
            } 
            await saveGroup(sharedValue as string)
        }   
        save()
        console.log(sharedValue)
    }, [sharedValue]) 
    return <div >


        <ScrollContainer horizontal={false} className="h-screen max-w-20 bg-[#161616] flex flex-col items-center">

            <div
                className='m-2 min-w-[3.5rem] min-h-[3.5rem] rounded-xl bg-inherit text-white flex items-center justify-center border border-white'
            >

                <Plus strokeWidth={2.5} onClick={handleOpen} />
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="Create-Group"
                    aria-describedby="Used-for-creating-groups ">

                    <NewGroupModal />

                </Modal>

            </div>
            {
                groups?.map((group) => group.solo && (

                    <div className='flex flex-row items-center'>
                        {sharedValue === group.id ? <div className='h-10 w-2 bg-white rounded-xl -scale-x-75' /> : null}
                        <div key={group.id}
                            className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                                backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                                backgroundColor: group.avatar ? 'transparent' : '#FFF',
                                backgroundSize: "cover"
                            }}
                            onClick={() => setSharedValue(group.id)}>
                            <p>
                                {group.name}
                            </p>

                        </div>

                    </div>

                ))



            }

            <hr className='w-[3.5rem] border-3' />

            {groups?.map((group) => !group.solo && (
                <div className='flex flex-row items-center'>
                    {sharedValue === group.id ? <div className='h-10 w-2 bg-white rounded-xl -scale-x-75' /> : null}
                    <div key={group.id}
                        className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center'
                        style={{
                            backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                            backgroundColor: group.avatar ? 'transparent' : '#FFF',
                            backgroundSize: "cover"
                        }}
                        onClick={() => setSharedValue(group.id)}>
                        <p>
                            {group.name}
                        </p>
                    </div>
                </div>
            ))

            }

        </ScrollContainer>


    </div>

}