import {AiFillCloseCircle, AiOutlineUser} from "react-icons/ai";

export const EnrolledMembersCard = (cls, members) => {
  return <div className="grid grid-cols-5 gap-4">
    {/* Loop through all the enrolled members and display their names */}
    {cls.enrolled.map(memberId => {
      const member = members.find(m => m.id === memberId);
      return <div key={memberId} className="flex flex-row items-center space-x-2">
        <AiOutlineUser className="inline-block text-4xl rounded-full bg-gray-500 p-2"/>
        <p>{member.name}</p>
      </div>;
    })}
    {/* If no members are enrolled, display a message */}
    {cls.enrolled.length === 0 && <div className={"flex flex-row items-center space-x-2"}>
      <AiFillCloseCircle className="inline-block text-4xl text-white"/>
      <p>No members enrolled</p>
    </div>}
  </div>;
}