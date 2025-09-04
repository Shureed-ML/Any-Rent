import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ListItem from "./components/ListItem.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import BrowseItems from "./components/BrowseItems.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/admin/AdminRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import { loginUser, registerUser } from "./services/api.js";
import './App.css';
import UserProfile from "./components/UserProfile.jsx";
import UserSettings from "./components/UserSettings.jsx";
import ItemDetails from "./components/ItemDetails.jsx";
import Inbox from "./components/Inbox.jsx";
import ChatPage from "./components/ChatPage.jsx";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Check for stored user data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [username, setUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({
        email: loginEmail,
        password: loginPassword
      });
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setMessage("Login successful!");
      setError("");
      // Clear form fields
      setLoginEmail("");
      setLoginPassword("");
      navigate('/');
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({
        username,
        email: registerEmail,
        password: registerPassword
      });
      // Clear form fields
      setUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      setMessage("Registration successful! Please login.");
      setError("");
      navigate('/login');
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div>
      <Navbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<h1 style={{ padding: '2rem' }}>Welcome to RentEase{user ? `, ${user.username}!` : '!'}</h1>} />
        <Route 
          path="/list" 
          element={
            <ProtectedRoute user={user}>
              <ListItem user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/browse" 
          element={
            <ProtectedRoute user={user}>
              <BrowseItems user={user} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <UserProfile user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <UserSettings user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/inbox"
          element={
            <ProtectedRoute user={user}>
              <Inbox user={user} />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/chat/:otherUserId/:itemId"
          element={
            <ProtectedRoute user={user}>
              <ChatPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/chat/:otherUserId"
          element={
            <ProtectedRoute user={user}>
              <ChatPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ItemDetails user={user} />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminLayout user={user} handleLogout={handleLogout} />
            </AdminRoute>
          }
        />
        <Route path="/login" element={
          <Login
            email={loginEmail}
            setEmail={setLoginEmail}
            password={loginPassword}
            setPassword={setLoginPassword}
            handleLogin={handleLogin}
            message={message}
            error={error}
          />
        } />
        <Route path="/register" element={
          <Register
            username={username}
            setUsername={setUsername}
            email={registerEmail}
            setEmail={setRegisterEmail}
            password={registerPassword}
            setPassword={setRegisterPassword}
            handleRegister={handleRegister}
            message={message}
            error={error}
          />
        } />
        <Route path="*" element={<h1 style={{ padding: '2rem' }}>Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
