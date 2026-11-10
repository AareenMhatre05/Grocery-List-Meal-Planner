import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { MotionConfig } from "framer-motion";
import { auth } from "./firebase";
import Home from "./components/Home";
import Pantry from "./components/Pantry";
import MealSuggestions from "./components/MealSuggestions";
import GroceryList from "./components/GroceryList";
import MealDetail from "./components/MealDetail";
import Login from "./components/Login";
import ProfilePage from "./components/ProfilePage";
import Planner from "./components/Planner";
import AppShell, { Logo } from "./components/AppShell";
import { ToastProvider } from "./ui/Toast";

// Protected Route Wrapper (uses Firebase Auth)
const ProtectedRoute = ({ user, children }) => {
  if (user === null) {
    // Auth state still loading
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" role="status">
        <Logo tone="forest" />
        <p className="text-sm text-ink-muted">Checking your sign-in</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = useState(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Router>
          <Routes>
            {/* Login Page (Public) */}
            <Route path="/login" element={<Login />} />

            {/* Protected Pages (Require Firebase Auth), all inside the app shell */}
            <Route
              element={
                <ProtectedRoute user={user}>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/pantry" element={<Pantry />} />
              <Route path="/meals" element={<MealSuggestions />} />
              <Route path="/meal/:id" element={<MealDetail />} />
              <Route path="/grocery" element={<GroceryList />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </MotionConfig>
  );
}

export default App;
