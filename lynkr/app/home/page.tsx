'use client'

import Activities from "@/components/activitiesClients";
import { CopyPlus } from "lucide-react";
import { Modal } from "@mui/material";
import { useState } from "react";
import NewActivityModal from "@/components/nActivityModal";


export default function Home() {

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>

      <main className=" bg-[#222222] h-screen">
        <div className="flex flex-row justify-items-center items-end">  <h1 className="p-5 text-white font-mono text-6xl font-bold">Activities coming up</h1>
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
      </main>
    </>
  );
}
