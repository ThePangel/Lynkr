"use server"

import { fetchGroups, loggingOut } from './actions'
import SideBarClient from './sideBarClient';


export default async function SideBar() {
    
    const groups = await fetchGroups();
        
    return <SideBarClient groups={groups} />
}