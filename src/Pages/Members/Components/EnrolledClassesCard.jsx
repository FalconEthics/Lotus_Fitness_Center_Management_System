import {SiGoogleclassroom} from "react-icons/si";
import {AiFillCloseCircle} from "react-icons/ai";

export const EnrolledClassesCard = (classes, member) => {
  return <div className="grid grid-cols-5 gap-4">
    {classes.filter(cls => cls.enrolled.includes(member.id)).map(cls => (
      <div key={cls.id} className="flex flex-row items-center space-x-2">
        <SiGoogleclassroom className="inline-block text-4xl text-white"/>
        <p>{cls.name}</p>
      </div>
    ))}
    {classes.filter(cls => cls.enrolled.includes(member.id)).length === 0 && (
      <div className={"flex flex-row items-center space-x-2"}>
        <AiFillCloseCircle className="inline-block text-4xl text-white"/>
        <p>Not Enrolled in any Classes</p>
      </div>
    )}
  </div>;
}