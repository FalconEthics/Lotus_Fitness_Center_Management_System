import {ErrorModal} from "../../Reusable_Components/ErrorModal.jsx";

export function InvalidRoute() {

  // Making it separate so that it can be moudlarized and reused.
  return (
    <ErrorModal Error={"404"}/>
  )
}