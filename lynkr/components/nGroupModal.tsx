import { joinGroup, newGroup } from "./actions";
import { useState } from "react";
import { Modal } from "@mui/material";
interface NewGroupModalProps {
    handleClose: () => void;
}

function ChildModal() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <button className="underline text-white font-semibold" onClick={handleOpen}>Join with code</button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <div className='flex flex-col items-center justify-start w-[25rem] h-[25rem] rounded-xl absolute top-[10rem] left-[35.4rem]'style={{ 
                backgroundColor: '#161616',
                 
              }}>
              
              <h1 className='inline-block text-white text-6xl p-5  font-bold font-mono'>Join with code</h1>
    
              <hr className='w-[23rem] border-3 m-3' />
    
              <form className='flex flex-col p-5 ' action={(formData) => { handleClose(); joinGroup(formData); }}>
                
                <label htmlFor="code" className='text-white font-semibold'>Code:</label>
                
                <input id="code" name="code" type="number" required className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[20rem] h-[2rem] text-white  font-mono'/>

                <button className="mt-7 mx-2 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" 
                type="submit">
                    Join</button>  
              
              </form>
              
            
            </div>
      </Modal>
    </>
  );
}


export default function NewGroupModal({ handleClose }: NewGroupModalProps) {

    return <div className='flex flex-col items-center justify-start w-[30rem] h-[30rem] rounded-xl absolute top-[7rem] left-[33rem]'style={{ 
                backgroundColor: '#161616',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))' 
              }}>
              
              <h1 className='inline-block text-white text-6xl p-5  font-bold font-mono'>Create Group</h1>
    
              <hr className='w-[28rem] border-3 m-3' />
    
              <form action={newGroup}className='flex flex-col p-5 '>
                
                <label htmlFor="name" className='text-white font-semibold'>Name:</label>
                
                <input id="name" name="name" type="name" required className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[25rem] h-[2rem] text-white  font-mono'/>
                
                <label className='text-white font-semibold' htmlFor="password">Solo:</label>
                
                <input id="solo" name="solo" type="checkbox" className='m-3 rounded-md bg-black  w-[25rem] h-[2rem] text-white'/>
                
                <button className="mt-12 mx-2 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" 
                type="submit">
                    Create</button>
                
                
              </form>
              <ChildModal />
            
            </div>
          
         

}