export const showEditFields = (editingClass, setEditingClass, handleUpdateClass) => {
  return <>
    <input
      type="text"
      placeholder="Class Name"
      value={editingClass.name}
      className={"border p-2 rounded text-black"}
      onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
    />
    <input
      type="text"
      placeholder="Instructor"
      className={"border p-2 rounded text-black"}
      value={editingClass.instructor}
      onChange={(e) => setEditingClass({...editingClass, instructor: e.target.value})}
    />
    <input
      type="text"
      placeholder="Schedule"
      className={"border p-2 rounded text-black"}
      value={editingClass.schedule}
      onChange={(e) => setEditingClass({...editingClass, schedule: e.target.value})}
    />
    <input
      type="number"
      placeholder="Capacity"
      className={"border p-2 rounded text-black"}
      value={editingClass.capacity}
      onChange={(e) => setEditingClass({...editingClass, capacity: parseInt(e.target.value)})}
    />
    <button onClick={handleUpdateClass} className="bg-blue-500 text-white p-2 rounded">Update Class</button>
  </>;
}