"use client"

import { LogOut, Plus } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import Modal from '@mui/material/Modal';
import NewGroupModal from './nGroupModal';
import { useState } from 'react';
import { loggingOut } from './actions';

export default function SideBarClient({ groups }: { groups: any[] }) {
    
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

        
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
                
                <NewGroupModal handleClose={handleClose} />

                </Modal>

        </div>
        {
            groups?.map((group) => group.solo && (

                    <div key={group.id}
                        className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                            backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                            backgroundColor: group.avatar ? 'transparent' : '#FFF',
                            backgroundSize: "cover"
                        }}>
                        <p>
                            {group.name}
                        </p>
                    </div>
                ))
            


        }

        <hr className='w-[3.5rem] border-3' />

        {groups?.map((group) => !group.solo && (

            <div key={group.id}
                className='m-2 w-[3.5rem] h-[3.5rem] rounded-xl bg-inherit text-black flex items-center justify-center' style={{
                    backgroundImage: group.avatar ? `url(${group.avatar})` : 'none',
                    backgroundColor: group.avatar ? 'transparent' : '#FFF',
                    backgroundSize: "cover"
                }}>
                <p>
                    {group.name}
                </p>
            </div>
        ))

        }
        <Tooltip title="LogOut">
            <LogOut className="cursor-pointer mt-auto pb-5 size-10 text-white" onClick={loggingOut} />
        </Tooltip>
    </section>


</div>

}