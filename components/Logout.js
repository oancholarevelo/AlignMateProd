import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { ref, remove, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const Logout = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const userUID = localStorage.getItem("userUID"); // Get UID before logout

  const handleLogout = async () => {
    try {
      // First, update Firebase
      if (userUID) {
        // Clear user session in Firebase
        await remove(ref(database, `users/${userUID}/currentSession`));
        console.log("Cleared user session in Firebase");

        // Clear currentUserUID to stop ESP32
        await set(ref(database, `/currentUserUID`), "");
        console.log("Cleared currentUserUID in Firebase");
      }

      // Then sign out from Firebase Auth
      await signOut(auth);
      console.log("User logged out from Firebase Auth");

      // Clear all relevant localStorage items
      localStorage.removeItem("userUID");
      localStorage.removeItem("userName");

      // Add a small delay to ensure Firebase operations complete
      setTimeout(() => {
        // Use window.location for a complete page reload
        // This ensures all components unmount and Firebase listeners are cleaned up
        window.location.href = "/login";
      }, 300);
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed: " + error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#F87A53",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Logout;
