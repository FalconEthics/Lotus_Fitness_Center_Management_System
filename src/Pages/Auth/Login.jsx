import bg from "../../assets/bg.webp";
import logo from "../../assets/logo.png";
import {useState} from "react";
import {useNavigate} from "react-router";
import {Loading} from "../../Reusable_Components/Loading.jsx";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (username === "") {
      alert("Username is required");
      window.document.getElementById("username").focus();
      return;
    } else if (password === "") {
      alert("Password is required");
      window.document.getElementById("password").focus();
      return;
    }

    if (username === "admin" && password === "admin") {
      setSuccess(true);
      // set auth ture in local storage
      localStorage.setItem("auth", "true");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      alert("Invalid Credentials");
    }
  }


  return (
    <div className="w-screen h-screen flex justify-start items-center relative">
      <img src={bg} alt="Background Image" className="w-full h-full object-cover absolute top-0 left-0 z-0 fade-in"/>
      <div
        className="z-10 text-white relative backdrop-blur-md p-10 border rounded-2xl shadow-2xl ml-[15%] flex flex-col space-y-6 justify-center items-center slide-in-from-left">
        <div className={"flex flex-col justify-center items-center space-y-2"}>
          <img src={logo} alt="Logo" className="w-48 h-auto"/>
          <p className={"font-bold text-red-600 text-4xl"}>Lotus Fitness Center</p>
          <p className={"text-lg"}>Management System</p>
        </div>
        {!success ? <form className="flex flex-col space-y-4 w-full text-black">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              id={"username"} type="text" placeholder="Username" className="p-2 rounded-lg"/>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              id={"password"} type="password" placeholder="Password" className="p-2 rounded-lg"/>
            <button
              onClick={handleSubmit}
              type="submit"
              className="p-2 bg-blue-500 rounded-lg hover:bg-white hover:text-blue-500 font-bold">Login
            </button>
          </form>
          : <div>
            <p className="text-3xl font-bold shadowlg">Welcome, Ujjwal 🙏</p>
            <Loading/>
          </div>}
      </div>
    </div>
  );
}