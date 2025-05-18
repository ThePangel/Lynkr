"use client"

import { Plus, Settings2 } from 'lucide-react';
import Modal from '@mui/material/Modal';
import NewGroupModal from './nGroupModal';
import { useState, useEffect } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll'
import { useShared } from './contentProvider';
import { fetchGroups, readGroup, saveGroup } from './actions';
import { Tooltip } from '@mui/material';
import GSettingsModal from './gSettingsModal';


export default function SideBarClient() {
    const { setSharedValue, sharedValue } = useShared();
    const [open1, setOpen1] = useState(false);
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState<any[]>()
    const handleOpen1 = () => setOpen1(true);
    const handleClose1 = () => setOpen1(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fGroups = async () => {
            const values = await fetchGroups()
            setGroups(values)

        }
        fGroups()

    }, [])
    useEffect(() => {
        console.log(sharedValue)
        const save = async () => {

            if (sharedValue === "00000000-0000-0000-0000-000000000000") {
                const value = await readGroup()
                setSharedValue(value?.value)
                console.log(sharedValue)
            }
            await saveGroup(sharedValue as string)
        }
        save()
        console.log(sharedValue)
    }, [sharedValue])
    return <div className="h-screen max-w-20 bg-[#161616] flex flex-col items-center">


        <div className="overflow-y-scroll h-screen max-w-20 bg-[#161616] flex flex-col items-center no-scrollbar">
            <Tooltip title="New Group">
            <div
                  className='cursor-pointer m-2 min-w-[3.5rem] min-h-[3.5rem] rounded-xl bg-inherit text-white flex items-center justify-center border border-white'
            >

                <Plus strokeWidth={2.5} onClick={handleOpen1}/>
                <Modal
                    open={open1}
                    onClose={handleClose1}
                    aria-labelledby="Create-Group"
                    aria-describedby="Used-for-creating-groups ">

                    <NewGroupModal />

                </Modal>

            </div>
            </Tooltip>

            {
                groups?.map((group) => group.solo && (

                    <div className='flex flex-row items-center'>
                        {sharedValue === group.id ? <div className='h-10 w-2 bg-white rounded-xl -scale-x-75' /> : null}
                        <Tooltip title={group.name}>
                        <div key={group.id}
                            className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                                backgroundImage: group.avatar ? `url(${JSON.parse(group.avatar).publicUrl})` : 'none',
                                backgroundColor: group.avatar ? 'transparent' : '#FFF',
                                backgroundSize: "cover"
                            }}
                            onClick={() => setSharedValue(group.id)}>
                            

                        </div>
                        </Tooltip>
                    </div>

                ))



            }

            <hr className='w-[3.5rem] border-3' />

            {groups?.map((group) => !group.solo && (
                <div className='flex flex-row items-center'>
                    {sharedValue === group.id ? <div className='h-10 w-2 bg-white rounded-xl -scale-x-75' /> : null}
                    <Tooltip title={group.name}>
                    <div key={group.id}
                        className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center'
                        style={{
                            backgroundImage: group.avatar ? `url(${JSON.parse(group.avatar).publicUrl})` : 'none',
                            backgroundColor: group.avatar ? 'transparent' : '#FFF',
                            backgroundSize: "cover"
                        }}
                        onClick={() => setSharedValue(group.id)}>
                        
                    </div>
                    </Tooltip>
                </div>
            ))

            }

        </div>
        <Tooltip title="Group Settings">
        <div
             className='cursor-pointer m-2 min-w-[3.5rem] min-h-[3.5rem] rounded-xl bg-inherit text-white flex items-center justify-center border border-white'
        >
            
              
                <Settings2 strokeWidth={2.5} onClick={handleOpen}/>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="Create-Group"
                    aria-describedby="Used-for-creating-groups ">

                    <GSettingsModal />

                </Modal>
             
               
        </div>
            </Tooltip>

    </div>

}