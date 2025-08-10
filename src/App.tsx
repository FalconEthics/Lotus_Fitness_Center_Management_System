import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import './styles/mobile.css';
import { Dashboard } from './Pages/Dashboard/Dashboard';
import { Login } from './Pages/Auth/Login';
import { InvalidRoute } from './Pages/LatterError/InvalidRoute';
import { Layout } from './Layout/Layout';
import { Classes } from './Pages/Classes/Classes';
import { Members } from './Pages/Members/Members';
import { PageTransition } from './components/PageTransition';
import WithAuthAndDataset from './Layout/WithAuthAndDataset';

// Wrapping the pages with the WithAuthAndDataset HOC to provide authentication and dataset validation.
const DashboardWithAuth = WithAuthAndDataset(Dashboard);
const ClassesWithAuth = WithAuthAndDataset(Classes);
const MembersWithAuth = WithAuthAndDataset(Members);
const InvalidRouteWithAuth = WithAuthAndDataset(InvalidRoute);

function AppRoutes(): JSX.Element {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/login" 
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          } 
        />
        <Route 
          path="/" 
          element={
            <Layout>
              <PageTransition>
                <DashboardWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
        <Route 
          path="/manageclasses" 
          element={
            <Layout>
              <PageTransition>
                <ClassesWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
        <Route 
          path="/managemembers" 
          element={
            <Layout>
              <PageTransition>
                <MembersWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
        <Route 
          path="*" 
          element={
            <Layout>
              <PageTransition>
                <InvalidRouteWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;