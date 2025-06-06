import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../firebase"; // Make sure database is imported
import { ref, set } from "firebase/database"; // Import ref and set

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => { // Made async
      setUser(authUser);
      if (!authUser) {
        // User is logged out or session expired
        try {
          await set(ref(database, "currentUserUID"), null); // Clear the UID in the database
        } catch (error) {
          console.error("Error clearing currentUserUID from database:", error);
        }
      }
      // If authUser exists, Login.js handles setting currentUserUID on initial login.
      // No need to set it here again on every auth state change if Login.js does it.
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}