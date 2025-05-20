import { Modal } from "@mui/material";
import { CopyPlus } from "lucide-react";
import { useState, useRef } from "react";
import { useShared } from "./contentProvider";
import { addStatus } from "./actions";

export default function NewStatusModal() {
    const { sharedValue } = useShared()
    const [ open, setOpen ] = useState(false)
    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }
    
    const formRef = useRef<HTMLFormElement>(null);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const form = formRef.current;
    if (!form) return;


    let formData = new FormData(form);


    addStatus(formData)
    
    handleClose()


  };
    return <div>    
        <CopyPlus onClick={handleOpen} className="text-white size-10" />
        <Modal
        open={open}
            onClose={handleClose}
            aria-labelledby="Create-Group"
            aria-describedby="Used-for-creating-groups " 
        >
            <div className="flex items-center justify-center h-screen w-screen pointer-events-none">
                    <div className='flex flex-col items-center justify-start w-[30rem] h-[35rem] rounded-xl pointer-events-auto' style={{
                    backgroundColor: '#161616',
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))'
                }}>
            
                    <h1 className='inline-block text-white text-6xl p-5  font-bold font-mono'>Add activity</h1>
            
                    <hr className='w-[28rem] border-3 m-3' />
                        
                        <form onSubmit={handleSubmit} ref={formRef} className='flex flex-col p-5 '>
            
                        <input type="hidden" name="groupId" value={sharedValue} />
                        <input type="hidden" name="created_at" value={new Date().toISOString()} />
            
                        <label htmlFor="name" className='text-white font-semibold'>Status:</label>
            
                        <input id="name" name="name" type="text" required className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[25rem] h-[2rem] text-white  font-mono' />
            
                        <button className="mt-12 mx-2 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                            type="submit">
                            Create</button>
            
            
                    </form>
            
            
                </div>
                </div>

        </Modal>

        
    </div>
}