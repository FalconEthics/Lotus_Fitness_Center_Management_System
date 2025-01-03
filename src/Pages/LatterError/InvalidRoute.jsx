import {ErrorModal} from "../../Reusable_Components/ErrorModal.jsx";

export function InvalidRoute() {
  return (
    <ErrorModal Error={"404"}/>
  )
}