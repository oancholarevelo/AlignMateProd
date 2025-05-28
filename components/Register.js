import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, set, update } from "firebase/database";
import { auth, database } from "../firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import PrivacyPolicyContent from "./PrivacyPolicy";
import TermsOfAgreementContent from "./TermsOfAgreement";
import DocumentRenderer from "./DocumentRenderer";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfAgreement, setShowTermsOfAgreement] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleRegister = () => {
    // Validate name is not empty
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      alert(
        "Please accept the Terms of Agreement and Privacy Policy to continue"
      );
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Registration successful", user.uid);

        // Store user data with multiple paths for reliability
        const updates = {};
        updates[`users/${user.uid}/email`] = user.email;
        updates[`users/${user.uid}/name`] = name.trim(); // Ensure no whitespace
        updates[`users/${user.uid}/userInfo/name`] = name.trim(); // Backup path
        updates[`users/${user.uid}/userInfo/email`] = user.email;
        updates[`users/${user.uid}/profile/displayName`] = name.trim(); // Another backup
        updates[`users/${user.uid}/termsAccepted`] = true; // Store terms acceptance
        updates[`users/${user.uid}/termsAcceptedDate`] =
          new Date().toISOString();

        // Use update for atomicity
        const { update } = require("firebase/database");
        update(ref(database), updates)
          .then(() => {
            console.log("User data saved successfully with name:", name);

            // Also store in localStorage immediately
            localStorage.setItem("userName", name.trim());
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userUID", user.uid);

            alert("Registration successful! Please log in.");
            navigate("/login");
          })
          .catch((error) => {
            console.error("Error saving user data:", error);
            alert(
              "Registration completed, but there was an issue saving your name. Please update it after login."
            );
            navigate("/login");
          });
      })
      .catch((error) => alert(error.message));
  };

  const handleGoogleSignIn = () => {
    // Check terms acceptance before Google sign-in
    if (!acceptedTerms) {
      alert(
        "Please accept the Terms of Agreement and Privacy Policy to continue"
      );
      return;
    }

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        console.log("Google sign-in successful", user.uid);

        // Ensure we have a name to use
        const displayName = user.displayName || "Google User";

        // Store user info in Firebase with multiple paths
        const updates = {};
        updates[`users/${user.uid}/email`] = user.email;
        updates[`users/${user.uid}/name`] = displayName;
        updates[`users/${user.uid}/userInfo/name`] = displayName; // Backup path
        updates[`users/${user.uid}/userInfo/email`] = user.email;
        updates[`users/${user.uid}/profile/displayName`] = displayName; // Another backup
        updates[`users/${user.uid}/termsAccepted`] = true; // Store terms acceptance
        updates[`users/${user.uid}/termsAcceptedDate`] =
          new Date().toISOString();

        const { update } = require("firebase/database");
        update(ref(database), updates)
          .then(() => {
            console.log("Google user data saved with name:", displayName);

            // Store user session data
            localStorage.setItem("userUID", user.uid);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userName", displayName);

            set(ref(database, "currentUserUID"), user.uid);
            navigate("/app");
          })
          .catch((error) => {
            console.error("Error saving Google user data:", error);
            // Still proceed with login despite data saving error
            localStorage.setItem("userUID", user.uid);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userName", displayName);

            set(ref(database, "currentUserUID"), user.uid);
            navigate("/app");
          });
      })
      .catch((error) => alert(error.message));
  };

  const DocumentModal = ({ visible, onClose, title, content }) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={true}
        >
          <DocumentRenderer content={content} />
        </ScrollView>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Svg width={80} height={80} viewBox="0 0 66 66" style={styles.icon}>
            <Path
              d="M61.5,3.8l-1.3-1.5c-1.1-1.3-3.1-1.7-4.6-0.6c-0.4,0.1,1.3-0.8-21,13h-3C9.8,1.1,11.1,1.7,10.5,1.7C9,0.6,7,0.9,5.8,2.2
                L4.5,3.8c-1.3,1.5-1.1,3.7,0.4,5c18.9,15.7,17.7,14.9,18.1,15v1c-19.6,6.9-9.9,3.5-12.7,4.5c-1.6,0.6-2.6,2.2-2.3,3.9l0.2,1.2
                c0.4,2.1,2.5,3.4,4.6,2.7l10.4-3.5c0.2,0.9,0.5,1.7,1.1,2.5l-11.6,3.7c-1.7,0.5-2.7,2.3-2.4,4l0.2,1.2c0.4,2.2,2.7,3.4,4.7,2.6
                l14.3-5.6v3.4l-14.9,5.4c-1.7,0.6-2.6,2.4-2.2,4.1l0.1,0.5c0.5,2.1,2.7,3.2,4.7,2.5l12.3-4.6V64c0,0.5,0.4,1,1,1h5.8
                c0.5,0,1-0.4,1-1V53.7l11.7,4.4c2,0.7,4.2-0.4,4.7-2.5l0.1-0.5c0.4-1.7-0.5-3.5-2.2-4.1l-14.2-5.2v-3.4l13.7,5.3
                c2,0.8,4.3-0.5,4.7-2.6l0.2-1.2c0.3-1.7-0.7-3.5-2.4-4l-11.1-3.6c0.5-0.7,0.9-1.5,1.1-2.4l9.7,3.3c2.1,0.7,4.2-0.6,4.6-2.7l0.2-1.2
                c0.3-1.7-0.7-3.3-2.3-3.9L43.7,25v-1.7L61.1,8.8C62.6,7.5,62.8,5.3,61.5,3.8z M41.7,32.2C41.7,32.2,41.7,32.2,41.7,32.2
                c-0.1,0.2-0.1,0.4,0,0.6c-0.2,2.4-2.2,4.3-4.7,4.3c-0.3,0-7.6,0-7.3,0c-2.6,0-4.8-2.1-4.8-4.8v-11c0-2.6,2.1-4.8,4.8-4.8H37
                c2.6,0,4.8,2.1,4.8,4.8V32.2z M26.4,15.5L19,9l9.2,5.8C27.6,14.9,26.9,15.2,26.4,15.5z M38.1,14.7l8.5-5.3l-6.7,5.8
                C39.3,15,38.7,14.8,38.1,14.7z M6.2,7.3C5.5,6.7,5.4,5.7,6,5l1.3-1.5c0.6-0.7,1.6-0.7,2.2-0.2l15.3,13.4c-1.1,1.2-1.8,2.8-1.8,4.6
                L6.2,7.3z M12.1,35.3c-0.9,0.3-1.9-0.3-2.1-1.2l-0.2-1.2c-0.1-0.8,0.3-1.5,1-1.8L23,26.8v4.9L12.1,35.3z M14.4,45.8
                c-0.9,0.4-1.9-0.2-2.1-1.2l-0.2-1.2c-0.1-0.8,0.3-1.6,1.1-1.8l12.5-4c1.1,0.8,2.4,1.3,3.8,1.3v1L14.4,45.8z M16.5,56.2
                c-0.9,0.3-1.9-0.2-2.1-1.1l-0.1-0.5c-0.2-0.8,0.2-1.6,1-1.8l14.2-5.2v3.8L16.5,56.2z M35.2,63.1h-3.9V39h3.9V63.1z M50.8,52.8
                c0.8,0.3,1.2,1.1,1,1.8l-0.1,0.5c-0.2,0.9-1.2,1.4-2.1,1.1l-12.4-4.6v-3.8L50.8,52.8z M53.9,43.5l-0.2,1.2c-0.2,1-1.2,1.5-2.1,1.2
                l-14.4-5.6V39c1.3,0,2.6-0.5,3.6-1.2l12.1,3.9C53.6,42,54.1,42.7,53.9,43.5z M55.1,31.1c0.7,0.3,1.2,1,1,1.8l-0.2,1.2
                c-0.2,1-1.1,1.5-2.1,1.2l-10.2-3.4V27L55.1,31.1z M59.8,7.3L43.7,20.8c-0.1-1.7-0.9-3.3-2.1-4.4L56.5,3.4c0.7-0.6,1.7-0.5,2.2,0.2
                L60,5C60.6,5.7,60.5,6.7,59.8,7.3z"
              fill="#5CA377"
            />
          </Svg>

          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#1B1212"
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#1B1212"
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#1B1212"
            secureTextEntry
            onChangeText={setPassword}
          />

          {/* Terms and Privacy Policy Section */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => setShowTermsOfAgreement(true)}
                >
                  Terms of Agreement
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => setShowPrivacyPolicy(true)}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, !acceptedTerms && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!acceptedTerms}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.googleButton,
              !acceptedTerms && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={!acceptedTerms}
          >
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: "#1B1212" }}>
              Already have an account?{" "}
              <Text
                style={{ color: "#5CA377", fontWeight: "bold" }}
                onPress={() => navigate("/login")}
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Document Modals */}
      <DocumentModal
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="Privacy Policy"
        content={PrivacyPolicyContent}
      />

      <DocumentModal
        visible={showTermsOfAgreement}
        onClose={() => setShowTermsOfAgreement(false)}
        title="Terms of Agreement"
        content={TermsOfAgreementContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B1212",
    marginBottom: 32,
  },
  input: {
    width: "80%",
    borderWidth: 2,
    borderColor: "#1B1212",
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1212",
  },
  termsContainer: {
    width: "80%",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#1B1212",
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#5CA377",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#1B1212",
    lineHeight: 20,
  },
  linkText: {
    color: "#5CA377",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  button: {
    width: "80%",
    backgroundColor: "#5CA377",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1B1212",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    borderColor: "#999999",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  googleButton: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1B1212",
    alignItems: "center",
    marginBottom: 16,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1212",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B1212",
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#1B1212",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAF9F6",
  },
  modalCloseButton: {
    margin: 20,
    backgroundColor: "#5CA377",
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1B1212",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default Register;
