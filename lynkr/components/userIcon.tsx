import { avatar } from './actions'
export default async function UserIcon() {

    return <div className='fixed top-0 right-0 m-3 w-[2.5rem] h-[2.5rem] rounded-full bg-inherit text-white flex items-center justify-center border border-white '
    style={{
        backgroundImage: await avatar() ? `url(${await avatar()})` : 'none',
        backgroundColor: await avatar() ? 'transparent' : '#FFF',
        backgroundSize: "cover"
    }}>

        
    </div>
    

}

