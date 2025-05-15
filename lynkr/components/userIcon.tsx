'use client'

import { avatar, loggingOut, updateUser } from './actions'
import { Modal } from '@mui/material'
import { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import { LogOut } from 'lucide-react';
import { useRef } from 'react';


function ChildModal() {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("")
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = formRef.current;
        if (!form) return;

        const fileInput = document.getElementById('avatar') as HTMLInputElement
        let formData = new FormData();

        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            formData.append('avatar', file);
        }

        formData.append('name', new FormData(form).get('name') as string)
        const name = formData.get('name')
        const avatar = formData.get('avatar')
        console.log(avatar)
        if (!name && !avatar) {
            setError("Please fill out at least one field")
            return;
        }
        updateUser(formData)
        handleClose()
        window.location.reload();


    };

    return (

        <>
            <p className="p-5 cursor-pointer text-white font-mono" onClick={handleOpen}>Edit Profile</p>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <div className='flex items-center justify-items-center justify-center h-screen w-screen pointer-events-none'>
                    <div className='flex flex-col items-center justify-start w-[25rem] h-[30rem] rounded-xl  pointer-events-auto' style={{
                        backgroundColor: '#161616',

                    }}>

                        <h1 className='inline-block text-white text-6xl p-5  font-bold font-mono'>Edit Profile</h1>

                        <hr className='w-[23rem] border-3 m-3' />

                        <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col p-5 '>

                            <label htmlFor="code" className='text-white font-semibold'>Username:</label>

                            <input id="name" name="name" type="text" className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[20rem] h-[2rem] text-white  font-mono' />

                            <label htmlFor="code" className='text-white font-semibold'>Avatar:</label>

                            <input id="avatar" name="avatar" type="file" accept="image/png, image/jpeg" className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[20rem] h-[2rem] text-white  font-mono' />


                            <button className="mt-7 mx-2 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                                type="submit">
                                Save</button>
                            <p className='text-red-600'>{error}</p>

                        </form>


                    </div>
                </div>
            </Modal>
        </>
    );
}



export default function UserIcon() {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            const url = await avatar();
            setAvatarUrl(url);
        };
        fetchAvatar();
    }, []);

    return <div onClick={() => { if (!open) { handleOpen(); } }} className='fixed top-0 right-0 m-3 w-[2.5rem] h-[2.5rem] rounded-full bg-inherit text-white flex items-center justify-center border border-white '
        style={{
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundColor: avatarUrl ? 'transparent' : '#FFF',
            backgroundSize: "cover"
        }}>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
        >
            <div className='flex flex-col items-center justify-items-center m-7 h-[8rem] w-[8rem] fixed top-7 right-0 rounded-md bg-[#161616]'>
                <ChildModal />
                <div className='cursor-pointer flex flex-row' onClick={loggingOut} >
                    <Tooltip title="LogOut">
                        <LogOut className=" mt-auto pb-5 size-10 text-white" />

                    </Tooltip>
                    <p className='text-white font-mono'>Log out</p>
                </div>
            </div>
        </Modal>

    </div>


}

