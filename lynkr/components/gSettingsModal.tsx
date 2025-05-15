"use client"
import { useState, useRef } from "react";
import { updateGroup } from "./actions";
import { useShared } from "./contentProvider";

export default function GSettingsModal() {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<any>()
    const formRef = useRef<HTMLFormElement>(null);
    const { sharedValue } = useShared();
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
        console.log(sharedValue)
        updateGroup(formData, sharedValue)

        //window.location.reload();


    };
    return <div className="flex items-center justify-center h-screen w-screen pointer-events-none">
        <div className='flex flex-col items-center justify-start w-[25rem] h-[30rem] rounded-xl  pointer-events-auto' style={{
            backgroundColor: '#161616',

        }}>

            <h1 className='inline-block text-white text-6xl p-5  font-bold font-mono'>Edit group</h1>

            <hr className='w-[23rem] border-3 m-3' />

            <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col p-5 '>

                <label htmlFor="code" className='text-white font-semibold'>Name:</label>

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




}