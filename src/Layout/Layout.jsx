import {Nav} from "./Nav.jsx";
import {Sidebar} from "./Sidebar.jsx";

export function Layout({children}) {
  // This component is a layout component that wraps the entire application.
  // It places the Nav and Sidebar components at the top and left of the screen respectively.
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