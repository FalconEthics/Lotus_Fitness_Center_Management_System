import {AiOutlineLoading} from "react-icons/ai";

export function Loading() {
  return (
    <div className={"p-4 w-full h-full flex flex-col space-y-2 justify-center items-center"}>
      <AiOutlineLoading className={"animate-spin text-4xl text-red-600"}/>
      <p className={"animate-pulse text-lg"}>Loading....</p>
    </div>
  )
}