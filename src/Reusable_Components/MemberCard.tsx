import {BiSolidUser} from "react-icons/bi";

export const MemberCard = ({member}) => (
  <div className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center w-80">
    <div className="flex flex-col justify-center items-center space-y-2">
      <BiSolidUser className="text-6xl border rounded-full shadow-lg p-2"/>
      <h1 className="text-xl font-bold">{member.name}</h1>
    </div>
    <div className="border-t-2 pt-2 w-full">
      <div className="flex flex-col">
        <h1 className="text-gray-500">Member Id:</h1>
        <p className="text-lg font-bold">{member.id}</p>
      </div>
      <div className="flex flex-col">
        <h1 className="text-gray-500">Email:</h1>
        <p className="text-lg font-bold">{member.email}</p>
      </div>
      <div className="flex flex-col">
        <h1 className="text-gray-500">Phone Number:</h1>
        <p className="text-lg font-bold">{member.phone}</p>
      </div>
      <div className="flex flex-col">
        <h1 className="text-gray-500">Membership Type:</h1>
        <p className="text-lg font-bold">{member.membershipType}</p>
      </div>
      <div className="flex flex-col">
        <h1 className="text-gray-500">Membership Start Date:</h1>
        <p className="text-lg font-bold">{member.startDate}</p>
      </div>
    </div>
  </div>
);