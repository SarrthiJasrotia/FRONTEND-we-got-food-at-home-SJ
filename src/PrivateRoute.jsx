// src/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

export default function PrivateRoute({ children }) {
  const auth = getAuth();
  const [user, setUser] = useState(undefined); // undefined = loading; null = logged out

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return () => unsub();
  }, [auth]);

  if (user === undefined) return <div className="p-6">Loading…</div>;
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}
