import {Nav} from "./Nav.jsx";
import {Sidebar} from "./Sidebar.jsx";

export function Layout({children}) {
  return (
    <div className="flex flex-col w-screen h-screen overflow-clip">
      <Nav/>
      <div className="flex flex-row w-full h-full overflow-x-clip">
        <Sidebar/>
        <main className="flex flex-col w-5/6">
          {children}
        </main>
      </div>
    </div>
  );
}