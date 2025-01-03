export const showValueFields = (cls, setEditingClass, handleDeleteClass) => {
  return <>
    <h3 className="text-3xl font-bold">{cls.name} Class</h3>
    <p>Instructor: {cls.instructor}</p>
    <p>Schedule: {cls.schedule}</p>
    <p>Capacity: {cls.capacity}</p>
    <p>Enrolled: {cls.enrolled.length}</p>
    <div className={"flex flex-row w-full"}>
      {/* Sets the editingClass state to the current class */}
      <button onClick={() => setEditingClass(cls)}
              className="bg-white text-gray-800 p-2 rounded w-1/2 mr-2 hover:scale-95">Edit
      </button>
      {/* Calls the handleDeleteClass function with the class id */}
      <button onClick={() => handleDeleteClass(cls.id)}
              className="bg-red-500 text-white p-2 rounded w-1/2 hover:scale-95">Delete
      </button>
    </div>
  </>;
}