import logo from "../assets/logo.png";
import {AiOutlineFullscreenExit} from "react-icons/ai";
import {useNavigate} from "react-router";

export function Nav() {
  const navigate = useNavigate();

  // This is just a mock function to simulate a logout action.
  function logout() {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-900 text-white p-4 flex flex-row justify-between slide-in-from-top w-full">
      <div className={"flex flex-row space-x-2 items-center font-bold text-xl"}>
        <img src={logo} alt={"LFC"} className={"w-16 h-auto"}/>
        <p>Lotus Fitness Center Management System</p>
      </div>
      <button
        onClick={logout}
        className={"flex flex-row space-x-2 items-center bg-red-700 text-white p-2 px-4 rounded-xl shadow-lg hover:scale-95"}>
        <AiOutlineFullscreenExit className={"cursor-pointer"}/>
        <p>Logout</p>
      </button>
    </nav>
  )
}