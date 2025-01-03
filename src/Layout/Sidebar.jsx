import {NavLink} from "react-router";
import {AiOutlineHome, AiOutlineBook, AiOutlineTeam} from "react-icons/ai";

// Changes to this array will reflect on the sidebar navigation.
const navItems = [
  {to: "/", icon: <AiOutlineHome/>, label: "Dashboard"},
  {to: "/manageclasses", icon: <AiOutlineBook/>, label: "Manage Classes"},
  {to: "/managemembers", icon: <AiOutlineTeam/>, label: "Manage Members"},
];

// This component is used to render each navigation item.
function NavItem({to, icon, label}) {
  return (
    <NavLink to={to} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {

  // This although is named Sidebar, it is actually a vertical navigation bar.
  return (
    <div className="bg-gray-800 text-white w-1/6 h-full flex flex-col p-4 space-y-4 slide-in-from-left">
      {navItems.map((item, index) => (
        <NavItem key={index} to={item.to} icon={item.icon} label={item.label}/>
      ))}
    </div>
  );
}