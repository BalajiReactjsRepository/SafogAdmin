import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginModule from "./Modules/LoginModule";
import DoctorsList from "./Modules/DoctorsList";
import ProtectedRoute from "./utils/ProtectedRoute";
import MainLayout from "./Modules/MainLayout";

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginModule />} />
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path='/doctors-list' element={<DoctorsList />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
