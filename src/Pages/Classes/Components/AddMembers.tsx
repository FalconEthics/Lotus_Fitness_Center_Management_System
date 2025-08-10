export const AddMembers = (setMemberToAdd, memberToAdd, members, cls, handleAddMemberToClass) => {
  return <div className="flex flex-row space-x-2">
    <select
      className={"border p-2 rounded w-1/2 text-black p-2"}
      onChange={(e) => setMemberToAdd(parseInt(e.target.value))} value={memberToAdd || ''}>
      <option value="" disabled>Select Member</option>
      {/* Loop through all the members and filter out the ones already enrolled in the class */}
      {members.filter(member => !cls.enrolled.includes(member.id)).map(member => (
        <option key={member.id} value={member.id}>{member.name}</option>
      ))}
    </select>
    <button onClick={() => handleAddMemberToClass(cls.id)}
            className="bg-green-500 text-white p-2 rounded w-1/2 hover:scale-95">Add
      Member
    </button>
  </div>;
}