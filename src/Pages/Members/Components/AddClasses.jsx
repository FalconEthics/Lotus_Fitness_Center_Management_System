export const AddClasses = (setClassToAdd, classToAdd, classes, member, handleAddMemberToClass) => {
  return <div className="flex flex-row space-x-2">
    <select
      className={"border p-2 rounded w-1/2 text-black p-2"}
      onChange={(e) => setClassToAdd(parseInt(e.target.value))} value={classToAdd || ''}>
      <option value="" disabled>Select Class</option>
      {classes.filter(cls => !cls.enrolled.includes(member.id) && cls.enrolled.length < cls.capacity).map(cls => (
        <option key={cls.id} value={cls.id}>{cls.name}</option>
      ))}
    </select>
    <button onClick={() => handleAddMemberToClass(member.id)}
            className="bg-green-500 text-white p-2 rounded w-1/2">Add to Class
    </button>
  </div>;
}