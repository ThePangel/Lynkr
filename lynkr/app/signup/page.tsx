'use client'

import { useRef, useState } from 'react';
import { signup } from './actions'
export default function LoginPage() {
  const [error, setError] = useState<string>()
  
  const formRef = useRef<HTMLFormElement>(null);
    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            console.log("test")
            const form = formRef.current;
            if (!form) return;
    
            
            let formData = new FormData(form);
           
            
            const message = await signup(formData)
            
            if( message === "weak_password") {
              setError("Password must be at least 6 characters long")
              
            } 
    
        };
  return (
    
    <div className='flex items-center justify-center h-screen bg-[#000]'>
       
       <div className='flex flex-col items-center justify-start w-[30rem] h-[35rem] rounded-xl'style={{ 
          backgroundColor: '#161616',
          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))' 
        }}>
        
        <h1 className='inline-block text-white text-6xl p-5  font-bold font-mono'>Sign Up</h1>

        <hr className='w-[28rem] border-3 m-3' />

        <form onSubmit={handleSubmit} ref={formRef} className='flex flex-col p-5 '>
          
        <label htmlFor="username" className='text-white font-semibold'>Username:</label>
          
          <input id="username" name="username" type="username" required className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[25rem] h-[2rem] text-white font-mono'/>
          
          
          <label htmlFor="email" className='text-white font-semibold'>Email:</label>
          
          <input id="email" name="email" type="email" required className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[25rem] h-[2rem] text-white font-mono'/>
          
          
          <label className='text-white font-semibold' htmlFor="password">Password:</label>
          
          <input id="password" name="password" type="password" required className='m-3 rounded-md bg-black outline-double outline-offset-2 outline-purple-900 w-[25rem] h-[2rem] text-white '/>
          
          <button 
          className="mt-12 mx-2 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900" 
          type="submit">
            Sign Up
          </button>  
          <p className='text-red-600'>{ error }</p>
          
          
        </form>
      
      </div>
    
    </div>
    
    
  )
}