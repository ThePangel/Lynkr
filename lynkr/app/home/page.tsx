'use client'

import Activities from "@/components/activitiesClients";
import { CopyPlus } from "lucide-react";
import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import NewActivityModal from "@/components/nActivityModal";
import { useShared } from "@/components/contentProvider";
import getGroup from "./actions";
import Status from "@/components/status";
import NewStatusModal from "@/components/nStatusModal";

export default function Home() {

  const [open, setOpen] = useState(false);
  const [ name, setName] = useState("")
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { sharedValue } = useShared();
  useEffect(() => {
    const name = async () => {
      const value = await getGroup(sharedValue)
      setName(value)
    }
    name()

  }, [sharedValue])
  
  
  return (
    <>

      <main className=" bg-[#222222] h-screen">
        <div className="flex flex-row justify-items-center items-end"> 
          <div className="flex flex-col">
            <h1 className="p-2 text-white font-mono text-3xl font-bold">{name}</h1> 
            <h1 className="p-3  text-white font-mono text-5xl font-bold">Activities coming up</h1>
          </div>
          
          <CopyPlus onClick={handleOpen} className="m-5 text-white size-10" />
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="Create-Group"
            aria-describedby="Used-for-creating-groups ">

            <NewActivityModal />

          </Modal>

        </div>

        <Activities />
        <div className="flex flex-row justify-items-center items-baseline">
          <h1 className="p-3  text-white font-mono text-5xl font-bold">Status</h1>
          <NewStatusModal />
        </div>
        
        <Status />
      </main>
    </>
  );
}
