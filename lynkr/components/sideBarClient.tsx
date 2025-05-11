"use client"

import { Plus } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';
import NewGroupModal from './nGroupModal';
import { useState } from 'react';
import { loggingOut } from './actions'
import { useShared } from './contentProvider';

export default function SideBarClient({ groups }: { groups: any[] }) {
    const { setSharedValue, sharedValue } = useShared();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [display, setDisplay] = useState(0);
    const handleDisplay = (index: number, groupId: any) => {
        setDisplay(index)
        
        setSharedValue(groupId)
        console.log(sharedValue)
        }

        
        return <div >


        <section className="h-screen max-w-20 bg-[#161616] flex flex-col items-center">

            <div
                className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-white flex items-center justify-center border border-white'
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
            groups?.map((group, index) => group.solo && (
            
                    <div className='flex flex-row items-center'>
                        { display === index ? <div className='h-10 w-2 bg-white rounded-xl -scale-x-75'/> : null}
                        <div key={group.id}
                            className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                                backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                                backgroundColor: group.avatar ? 'transparent' : '#FFF',
                                backgroundSize: "cover"
                            }}
                            onClick={() => handleDisplay(index, group.id)}>
                            <p>
                                {group.name}
                            </p>
                            
                        </div>
                        
                    </div>

                ))
            


        }

        <hr className='w-[3.5rem] border-3' />

        {groups?.map((group, index) => !group.solo && (
            <div className='flex flex-row items-center'>
                { display === index ? <div className='h-10 w-2 bg-white rounded-xl -scale-x-75'/> : null}
                <div key={group.id}
                    className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' 
                    style={{
                        backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                        backgroundColor: group.avatar ? 'transparent' : '#FFF',
                        backgroundSize: "cover"
                    }}
                    onClick={() => handleDisplay(index, group.id)}>
                    <p>
                        {group.name}
                    </p>
                </div>
            </div>
        ))

        }
        
    </section>


</div>

}