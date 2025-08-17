import bg from "../../assets/bg.webp";
import { AiOutlineReload } from "react-icons/ai";
import { ErrorModalProps } from "../../types";

export function ErrorModal(props: ErrorModalProps): JSX.Element {
  return (
    <div className={"w-screen h-screen flex justify-start items-center relative"}>
      <img src={bg} alt="bg" className={"w-screen h-screen object-cover absolute z-0"}/>
      <div
        className={"w-fit h-fit backdrop-blur-md border text-white p-10 rounded-lg shadow-lg flex flex-col space-y-2 relative z-30 ml-[13%]"}>
        {/* Capable of displaying error codes */}
        <h1
          className="text-3xl font-bold text-red-600">{props.Error ? `The app crashed with error code ${props.Error}!` : "Oops! Something went wrong 😟"}</h1>
        <p className="text-lg">Please try again later.</p>
        <button onClick={() => window.location.reload()}
                className="bg-blue-500 text-white p-2 rounded w-full flex flex-row justify-center items-center space-x-2">
          <AiOutlineReload className="text-xl"/>
          <p>Reload</p>
        </button>
      </div>
    </div>
  )
}