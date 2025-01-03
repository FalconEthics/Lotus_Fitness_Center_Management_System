export const showValueFields = (member, setEditingMember, handleDeleteMember) => {
  return <>
    <h3 className="text-3xl font-bold">{member.name}</h3>
    <p>Email: {member.email}</p>
    <p>Phone: {member.phone}</p>
    <p>Membership Type: {member.membershipType}</p>
    <p>Start Date: {member.startDate}</p>
    <div className={"flex flex-row w-full"}>
      <button onClick={() => setEditingMember(member)}
              className="bg-white text-gray-800 p-2 rounded w-1/2 mr-2">Edit
      </button>
      <button onClick={() => handleDeleteMember(member.id)}
              className="bg-red-500 text-white p-2 rounded w-1/2">Delete
      </button>
    </div>
  </>;
}