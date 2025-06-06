import { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import "./App.css";

const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  
  const login = (data) => {
    if (data.username === "admin" && data.password === "admin") {
      localStorage.setItem("token", JSON.stringify(data));
      setIsAuthenticated(true);
      setUser(data);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        setIsAuthenticated(true);
        setUser(JSON.parse(token));
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function ProtectRoutes() {
  const { isAuthenticated, user } = useContext(AuthContext);
  return isAuthenticated && user ? <Outlet /> : <Navigate to="/login" />;
}

function PublicRoutes({ restricted = false }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated && restricted ? (
    <Navigate to={"/dashboard"} replace />
  ) : (
    <Outlet />
  );
}

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/login">Login</Link>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div>
      <h1>Dashboard</h1>
      {user && <p>{user.username}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function Login() {
  const { login } = useContext(AuthContext);
  return (
    <div>
      <h1>Login</h1>
      <Link to="/">Home</Link> <br />
      <button onClick={() => login({ username: "admin", password: "admin" })}>
        Login
      </button>
    </div>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              element={<PublicRoutes />}
              children={<Route path="/" element={<Home />} />}
            />

            {/* Protected routes */}
            <Route
              element={<ProtectRoutes />}
              children={<Route path="/dashboard" element={<Dashboard />} />}
            />

            {/* Restricted routes */}
            <Route
              element={<PublicRoutes restricted />}
              children={<Route path="/login" element={<Login />} />}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
