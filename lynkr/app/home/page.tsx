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
import KonamiVideo from "@/components/majik";
import Chat from "@/components/chat";

export default function Home() {


  const [name, setName] = useState("")

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
            <h1 className="p-2 text-white font-mono text-3xl font-bold">{name} <br /> Code:{sharedValue}</h1>
            <h1 className="p-3  text-white font-mono text-5xl font-bold">Activities coming up</h1>
          </div>
          <NewActivityModal />


        </div>

        <Activities />
        <div className="inline-flex flex-row justify-items-center items-baseline">
          <h1 className="p-3  text-white font-mono text-5xl font-bold">Status</h1>
          <NewStatusModal />
        </div>
        
        <div className="flex flex-row">
          <Status />
          <KonamiVideo />
          <Chat />
        </div>
      </main>
    </>
  );
}
