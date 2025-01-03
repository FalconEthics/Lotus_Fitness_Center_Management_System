import {BrowserRouter, Route, Routes} from 'react-router';
import './App.css';
import {Dashboard} from './Pages/Dashboard/Dashboard.jsx';
import {Login} from './Pages/Auth/Login.jsx';
import {InvalidRoute} from './Pages/LatterError/InvalidRoute.jsx';
import {Layout} from './Layout/Layout.jsx';
import {Classes} from './Pages/Classes/Classes.jsx';
import {Members} from './Pages/Members/Members.jsx';
import WithAuthAndDataset from './Layout/WithAuthAndDataset.jsx';

// Wrapping the pages with the WithAuthAndDataset HOC to provide authentication and dataset validation.
const DashboardWithAuth = WithAuthAndDataset(Dashboard);
const ClassesWithAuth = WithAuthAndDataset(Classes);
const MembersWithAuth = WithAuthAndDataset(Members);
const InvalidRouteWithAuth = WithAuthAndDataset(InvalidRoute);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Layout><DashboardWithAuth/></Layout>}/>
        <Route path="/manageclasses" element={<Layout><ClassesWithAuth/></Layout>}/>
        <Route path="/managemembers" element={<Layout><MembersWithAuth/></Layout>}/>
        <Route path="*" element={<Layout><InvalidRouteWithAuth/></Layout>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;