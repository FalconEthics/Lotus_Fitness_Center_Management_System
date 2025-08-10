export const showEditFields = (editingMember, setEditingMember, membershipTypes, handleUpdateMember) => {
  return <>
    <input
      type="text"
      placeholder="Name"
      value={editingMember.name}
      className={"border p-2 rounded text-black"}
      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
    />
    <input
      type="email"
      placeholder="Email"
      className={"border p-2 rounded text-black"}
      value={editingMember.email}
      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
    />
    <input
      type="text"
      placeholder="Phone"
      className={"border p-2 rounded text-black"}
      value={editingMember.phone}
      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
    />
    <select
      className={"border p-2 rounded text-black"}
      value={editingMember.membershipType}
      onChange={(e) => setEditingMember({...editingMember, membershipType: e.target.value})}
    >
      <option value="" disabled>Select Membership Type</option>
      {membershipTypes.map(type => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
    <input
      type="date"
      placeholder="Start Date"
      className={"border p-2 rounded text-black"}
      value={editingMember.startDate}
      onChange={(e) => setEditingMember({...editingMember, startDate: e.target.value})}
    />
    <button onClick={handleUpdateMember} className="bg-blue-500 text-white p-2 rounded">Update Member
    </button>
  </>;
}