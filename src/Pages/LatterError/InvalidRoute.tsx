import {ErrorModal} from "../../components/ui/ErrorModal";

export function InvalidRoute() {

  // Making it separate so that it can be moudlarized and reused.
  return (
    <ErrorModal Error={"404"}/>
  )
}