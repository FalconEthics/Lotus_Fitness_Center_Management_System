import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css';
import { Dashboard } from './Pages/Dashboard/Dashboard';
import { Login } from './Pages/Auth/Login';
import { InvalidRoute } from './Pages/LatterError/InvalidRoute';
import { Layout } from './Layout/Layout';
import { Classes } from './Pages/Classes/Classes';
import { Members } from './Pages/Members/Members';
import WithAuthAndDataset from './Layout/WithAuthAndDataset';

// Wrapping the pages with the WithAuthAndDataset HOC to provide authentication and dataset validation.
const DashboardWithAuth = WithAuthAndDataset(Dashboard);
const ClassesWithAuth = WithAuthAndDataset(Classes);
const MembersWithAuth = WithAuthAndDataset(Members);
const InvalidRouteWithAuth = WithAuthAndDataset(InvalidRoute);

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><DashboardWithAuth /></Layout>} />
        <Route path="/manageclasses" element={<Layout><ClassesWithAuth /></Layout>} />
        <Route path="/managemembers" element={<Layout><MembersWithAuth /></Layout>} />
        <Route path="*" element={<Layout><InvalidRouteWithAuth /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;