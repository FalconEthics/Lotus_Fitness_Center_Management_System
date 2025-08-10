// Just to make things reusable
export const StatCard = ({icon: Icon, title, value}) => (
  <div className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center">
    <div className="flex flex-row items-center space-x-2">
      <Icon className="text-2xl"/>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
    <h1 className="text-4xl font-bold">{value}</h1>
  </div>
);