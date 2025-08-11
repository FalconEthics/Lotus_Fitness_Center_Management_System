import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './styles/mobile.css';
import { Dashboard } from './Pages/Dashboard/Dashboard';
import { Login } from './Pages/Auth/Login';
import { InvalidRoute } from './Pages/LatterError/InvalidRoute';
import { Layout } from './Layout/Layout';
import { Classes } from './Pages/Classes/Classes';
import { Members } from './Pages/Members/Members';
import { Plans } from './Pages/Plans/Plans';
import { Trainers } from './Pages/Trainers/Trainers';
import { Attendance } from './Pages/Attendance/Attendance';
import { Profile } from './Pages/Profile/Profile';
import { PageTransition } from './components/PageTransition';
import WithAuthAndDataset from './Layout/WithAuthAndDataset';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Wrapping the pages with the WithAuthAndDataset HOC to provide authentication and dataset validation.
const DashboardWithAuth = WithAuthAndDataset(Dashboard);
const ClassesWithAuth = WithAuthAndDataset(Classes);
const MembersWithAuth = WithAuthAndDataset(Members);
const PlansWithAuth = WithAuthAndDataset(Plans);
const TrainersWithAuth = WithAuthAndDataset(Trainers);
const AttendanceWithAuth = WithAuthAndDataset(Attendance);
const ProfileWithAuth = WithAuthAndDataset(Profile);
const InvalidRouteWithAuth = WithAuthAndDataset(InvalidRoute);

function AppRoutes(): JSX.Element {
  const location = useLocation();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

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
          path="/manageplans" 
          element={
            <Layout>
              <PageTransition>
                <PlansWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
        <Route 
          path="/managetrainers" 
          element={
            <Layout>
              <PageTransition>
                <TrainersWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <Layout>
              <PageTransition>
                <AttendanceWithAuth />
              </PageTransition>
            </Layout>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <Layout>
              <PageTransition>
                <ProfileWithAuth />
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;