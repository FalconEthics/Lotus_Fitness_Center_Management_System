import {NavLink} from "react-router";
import {AiOutlineHome, AiOutlineBook, AiOutlineTeam} from "react-icons/ai";

const navItems = [
  {to: "/", icon: <AiOutlineHome/>, label: "Dashboard"},
  {to: "/manageclasses", icon: <AiOutlineBook/>, label: "Manage Classes"},
  {to: "/managemembers", icon: <AiOutlineTeam/>, label: "Manage Members"},
];

function NavItem({to, icon, label}) {
  return (
    <NavLink to={to} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <div className="bg-gray-800 text-white w-1/6 h-full flex flex-col p-4 space-y-4 slide-in-from-left">
      {navItems.map((item, index) => (
        <NavItem key={index} to={item.to} icon={item.icon} label={item.label}/>
      ))}
    </div>
  );
}