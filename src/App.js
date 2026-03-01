import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";

import Login from "./pages/LoginScreen";
import Register from "./pages/RegisterScreen";
import Home from "./pages/HomeScreen";
import Chat from "./pages/Chat";
import Profile from "./pages/ProfileScreen";

/* ================= PROTECTED ROUTE ================= */
function PrivateRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/* ================= PUBLIC ROUTE ================= */
function PublicRoute() {
  const { user } = useContext(AuthContext);

  return user ? <Navigate to="/" replace /> : <Outlet />;
}

/* ================= PRIVATE LAYOUT ================= */
function PrivateLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

/* ================= MAIN APP ================= */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* PRIVATE ROUTES */}
            <Route element={<PrivateRoute />}>
              <Route element={<PrivateLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
