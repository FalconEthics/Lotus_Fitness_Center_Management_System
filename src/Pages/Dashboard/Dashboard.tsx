import { useDataset } from '../../contexts/DatasetContext';
import { AiFillDashboard, AiOutlineMenu, AiOutlineUser, AiOutlineUserAdd, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { MdEventSeat } from 'react-icons/md';
import { CgAdd } from 'react-icons/cg';

// Just to make things reusable
import { MemberCard } from "../../Reusable_Components/MemberCard";
import { StatCard } from "../../Reusable_Components/StatCard";

export function Dashboard(): JSX.Element {
  const dataset = useDataset();

  return (
    <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800">
      {/* This is the dashboard header */}
      <div className="flex flex-row items-center space-x-2">
        <AiFillDashboard className="text-4xl"/>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:items-center md:space-x-2 md:justify-start">
        {/* There's no db so i just computed the values */}
        <StatCard icon={AiOutlineUsergroupAdd} title="Total Users" value={dataset.members.length}/>
        <StatCard icon={AiOutlineMenu} title="Total Classes" value={dataset.classes.length}/>
        <StatCard icon={MdEventSeat} title="Available Seats"
                  value={dataset.classes.reduce((acc, cls) => acc + (cls.capacity - cls.enrolled.length), 0)}/>
        <StatCard icon={AiOutlineUserAdd} title="Unassigned Users"
                  value={dataset.members.filter(member => !dataset.classes.some(cls => cls.enrolled.includes(member.id))).length}/>
        {/* This button is just a placeholder */}
        <button
          onClick={() => {
            alert('Feature not available yet!');
          }}
          className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center bg-gray-800 text-white hover:scale-95"
        >
          <div className="flex flex-row items-center space-x-2">
            <CgAdd className="text-4xl"/>
          </div>
          <h1 className="text-2xl font-bold">add more cards!</h1>
        </button>
      </div>
      {/* This is the recently joined section */}
      <div className="flex flex-row items-center space-x-2">
        <AiOutlineUser className="text-4xl"/>
        <h1 className="text-2xl font-bold">Recently Joined</h1>
      </div>
      <div className="flex flex-row items-center space-x-2 justify-start overflow-x-auto">
        {/* Again, there's no db so i just sliced the array */}
        {dataset.members.slice(0, 7).map(member => (
          <MemberCard key={member.id} member={member}/>
        ))}
      </div>
    </div>
  );
}