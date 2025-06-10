import React, { useState, useEffect } from "react"; // Added useEffect
import {
  // getAuth, // auth is imported from firebase.js
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  // signInWithRedirect, // Not used in this flow
  // getRedirectResult, // Not used in this flow
  signInWithPopup, // For Web Google Sign-In
  signInWithCredential, // For Native Google Sign-In
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, set, update as firebaseUpdate } from "firebase/database"; // Renamed update to firebaseUpdate to avoid conflict
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
  Platform, // Added Platform
  Alert, // Added Alert for native error display
  ActivityIndicator, // Added for loading state in buttons
} from "react-native";
import Svg, { Path } from "react-native-svg";
import PrivacyPolicyContent from "./PrivacyPolicy";
import TermsOfServiceContent from "./TermsOfService";
import DocumentRenderer from "./DocumentRenderer";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin"; // Import GoogleSignin
import { registerStyles as styles } from "../styles/AuthStyles";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailApiError, setEmailApiError] = useState("");
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider(); // Keep for web
  const githubProvider = new GithubAuthProvider();

  const GoogleLogo = ({ size = 18, style }) => (
    <Svg width={size} height={size} viewBox="0 0 18 18" style={style}>
      <Path
        d="M17.64 9.20455C17.64 8.56625 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.9702 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
        fill="#4285F4"
      />
      <Path
        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
        fill="#34A853"
      />
      <Path
        d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29H0.957275C0.347727 8.36182 0 9.65455 0 11.0227C0 12.3909 0.347727 13.6836 0.957275 14.7555L3.96409 10.71Z"
        fill="#FBBC05"
      />
      <Path
        d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34545C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
        fill="#EA4335"
      />
    </Svg>
  );

  const GitHubLogo = ({ size = 20, style, color = "#FFFFFF" }) => (
    <Svg width={size} height={size} viewBox="0 0 16 16" style={style}>
      <Path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        fill={color}
      />
    </Svg>
  );

  useEffect(() => {
    if (Platform.OS !== "web") {
      GoogleSignin.configure({
        webClientId:
          "32530267491-ks7jna6s3nd58pq7trl888kb7hpr3oo3.apps.googleusercontent.com", // Your Web Client ID
        offlineAccess: false,
      });
    }
  }, []);

  // Password validation function
  const validatePassword = (passwordToValidate) => {
    // Renamed parameter
    const errors = [];
    if (passwordToValidate.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(passwordToValidate)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(passwordToValidate)) errors.push("One lowercase letter");
    if (!/\d/.test(passwordToValidate)) errors.push("One number");
    if (!/[@$!%*?&]/.test(passwordToValidate))
      errors.push("One special character (@$!%*?&)");
    const commonPasswords = [
      "password",
      "123456",
      "12345678",
      "qwerty",
      "abc123",
      "password123",
      "123456789",
      "welcome",
      "admin",
      "letmein",
    ];
    if (commonPasswords.includes(passwordToValidate.toLowerCase()))
      errors.push("Password is too common");
    return errors;
  };

  // Email validation function
  const validateEmail = (emailToValidate) => {
    // Renamed parameter
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  // Handle password change with real-time validation
  const handlePasswordChange = (text) => {
    setPassword(text);
    const errors = validatePassword(text);
    setPasswordErrors(errors);
  };

  const passwordsMatch = () => {
    return password === confirmPassword;
  };

  const handleRegister = () => {
    setEmailApiError("");
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }
    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      Alert.alert(
        "Password Issue",
        `Password must have:\n• ${passwordValidationErrors.join("\n• ")}`
      );
      return;
    }
    if (!passwordsMatch()) {
      Alert.alert(
        "Password Issue",
        "Passwords do not match. Please check your password and try again."
      );
      return;
    }
    if (!acceptedTerms) {
      Alert.alert(
        "Terms Not Accepted",
        "Please accept the Terms of Service and Privacy Policy to continue"
      );
      return;
    }

    setIsLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Registration successful", user.uid);

        const updates = {};
        const trimmedName = name.trim();
        updates[`users/${user.uid}/email`] = user.email;
        updates[`users/${user.uid}/name`] = trimmedName;
        updates[`users/${user.uid}/userInfo/name`] = trimmedName;
        updates[`users/${user.uid}/userInfo/email`] = user.email;
        updates[`users/${user.uid}/profile/displayName`] = trimmedName;
        updates[`users/${user.uid}/termsAccepted`] = true;
        updates[`users/${user.uid}/termsAcceptedDate`] =
          new Date().toISOString();
        updates[`users/${user.uid}/registrationDate`] =
          new Date().toISOString();
        updates[`users/${user.uid}/authProvider`] = "email";

        firebaseUpdate(ref(database), updates)
          .then(() => {
            console.log("User data saved successfully with name:", trimmedName);
            localStorage.setItem("userName", trimmedName);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userUID", user.uid);
            Alert.alert("Success", "Registration successful! Please log in.");
            navigate("/login");
          })
          .catch((error) => {
            console.error("Error saving user data:", error);
            Alert.alert(
              "Partial Success",
              "Registration completed, but there was an issue saving your details. Please update it after login."
            );
            navigate("/login");
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((error) => {
        setIsLoading(false); // Ensure loading is stopped
        if (error.code === "auth/email-already-in-use") {
          setEmailApiError(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          let errorMessage = "Registration failed. Please try again.";
          switch (error.code) {
            case "auth/weak-password":
              errorMessage =
                "Password is too weak. Please choose a stronger password.";
              break;
            case "auth/invalid-email":
              errorMessage = "Please enter a valid email address.";
              break;
            case "auth/operation-not-allowed":
              errorMessage =
                "Email registration is not enabled. Please contact support.";
              break;
            default:
              console.error("Registration error:", error);
          }
          Alert.alert("Registration Error", errorMessage);
        }
      });
  };

  const saveUserData = (user, providerName = "unknown") => {
    // Added default for providerName
    const displayName =
      user.displayName ||
      name.trim() ||
      `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`;
    const userEmail = user.email;

    const updates = {};
    updates[`users/${user.uid}/email`] = userEmail;
    updates[`users/${user.uid}/name`] = displayName;
    updates[`users/${user.uid}/userInfo/name`] = displayName;
    updates[`users/${user.uid}/userInfo/email`] = userEmail;
    updates[`users/${user.uid}/profile/displayName`] = displayName;
    updates[`users/${user.uid}/termsAccepted`] = true;
    updates[`users/${user.uid}/termsAcceptedDate`] = new Date().toISOString();
    updates[`users/${user.uid}/registrationDate`] = new Date().toISOString();
    updates[`users/${user.uid}/authProvider`] = providerName;

    return firebaseUpdate(ref(database), updates)
      .then(() => {
        console.log(`${providerName} user data saved with name:`, displayName);
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userName", displayName);
        navigate("/app");
      })
      .catch((dbError) => {
        console.error(`Error saving ${providerName} user data:`, dbError);
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userName", displayName);
        Alert.alert(
          "Partial Success",
          "Account created, but there was an issue saving some details. You can update them in your profile."
        );
        navigate("/app");
      });
  };

  const handleGoogleSignIn = async () => {
    if (!acceptedTerms) {
      Alert.alert(
        "Terms Not Accepted",
        "Please accept the Terms of Service and Privacy Policy to continue"
      );
      return;
    }
    setIsLoading(true);

    // saveUserData function is now more generic and defined above

    if (Platform.OS === "web") {
      // Web Google Sign-In
      signInWithPopup(auth, googleProvider)
        .then(async (result) => {
          const user = result.user;
          console.log("Google sign-in successful (Web)", user.uid);
          await saveUserData(user, "google-web");
        })
        .catch((error) => {
          console.error("Google Sign In Error (Web)", error);
          Alert.alert(
            "Google Sign-Up Error",
            `Failed to sign up with Google: ${error.message}`
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Native Google Sign-In
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        const { idToken, user: googleNativeUser } = await GoogleSignin.signIn();
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(
          auth,
          googleCredential
        );
        const user = userCredential.user;

        const finalName =
          googleNativeUser.name ||
          user.displayName ||
          name.trim() ||
          "Google User";
        const firebaseUserWithDetails = {
          ...user,
          displayName: finalName,
          email: googleNativeUser.email || user.email,
        };

        console.log("Google sign-in successful (Native)", user.uid);
        await saveUserData(firebaseUserWithDetails, "google-native");
      } catch (error) {
        let message = "Google Sign-Up failed. Please try again.";
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          message = "Google Sign-Up was cancelled.";
        } else if (error.code === statusCodes.IN_PROGRESS) {
          message = "Google Sign-Up is already in progress.";
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          message =
            "Google Play services not available or outdated. Please update them.";
        } else {
          console.error("Google Sign In Error (Native)", error);
          message = `Google Sign-Up Error: ${error.message || error.code}`;
        }
        Alert.alert("Google Sign-Up Error", message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGitHubSignUp = async () => {
    if (!acceptedTerms) {
      Alert.alert(
        "Terms Not Accepted",
        "Please accept the Terms of Service and Privacy Policy to continue"
      );
      return;
    }
    setIsLoading(true);
    // Note: For native platforms, signInWithPopup will open a browser.
    // For a more integrated native experience, you might need a specific GitHub SDK
    // to get a token and then use signInWithCredential(auth, GithubAuthProvider.credential(token)).
    // Ensure you have enabled GitHub as a sign-in provider in your Firebase console.
    signInWithPopup(auth, githubProvider)
      .then(async (result) => {
        const user = result.user;
        console.log("GitHub sign-up successful", user.uid);
        // The name field might not be pre-filled by GitHub in the same way as Google.
        // `saveUserData` will use the entered name if available, or "GitHub User".
        await saveUserData(user, "github");
      })
      .catch((error) => {
        console.error("GitHub Sign Up Error", error);
        let errorMessage = `Failed to sign up with GitHub: ${error.message}`;
        if (error.code === "auth/account-exists-with-different-credential") {
          errorMessage =
            "An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.";
        }
        Alert.alert("GitHub Sign-Up Error", errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  const EyeIcon = ({ visible, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.eyeIcon}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        {visible ? (
          <Path
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
            fill="#1B1212"
          />
        ) : (
          <>
            <Path
              d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
              fill="#1B1212"
            />
          </>
        )}
      </Svg>
    </TouchableOpacity>
  );

  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      validateEmail(email) &&
      passwordErrors.length === 0 &&
      password !== "" &&
      passwordsMatch() &&
      acceptedTerms
    );
  };

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
            value={name}
          />
          <TextInput
            style={[
              styles.input,
              ((!validateEmail(email) && email !== "") || emailApiError) && styles.inputError,
            ]}
            placeholder="Email"
            placeholderTextColor="#1B1212"
            onChangeText={(text) => {
              setEmail(text);
              setEmailApiError(""); // Clear API error when email changes
            }}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailApiError ? (
            <Text style={styles.errorText}>{emailApiError}</Text>
          ) : null}

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                passwordErrors.length > 0 &&
                  password !== "" &&
                  styles.inputError,
              ]}
              placeholder="Password"
              placeholderTextColor="#1B1212"
              secureTextEntry={!showPassword}
              onChangeText={handlePasswordChange}
              value={password}
            />
            <EyeIcon
              visible={showPassword}
              onPress={() => setShowPassword(!showPassword)}
            />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                confirmPassword !== "" &&
                  !passwordsMatch() &&
                  styles.inputError,
              ]}
              placeholder="Confirm Password"
              placeholderTextColor="#1B1212"
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
            <EyeIcon
              visible={showConfirmPassword}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

          {confirmPassword !== "" && !passwordsMatch() && (
            <View style={styles.passwordMismatchContainer}>
              <Text style={styles.passwordMismatchText}>
                ✕ Passwords do not match
              </Text>
            </View>
          )}

          {confirmPassword !== "" && passwordsMatch() && password !== "" && (
            <View style={styles.passwordMatchContainer}>
              <Text style={styles.passwordMatchText}>✓ Passwords match</Text>
            </View>
          )}

          {password !== "" && passwordErrors.length > 0 && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.passwordRequirementsTitle}>
                Password must have:
              </Text>
              {passwordErrors.map((error, index) => (
                <Text key={index} style={styles.passwordRequirementItem}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {password !== "" && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.passwordStrengthBar}>
                <View
                  style={[
                    styles.passwordStrengthFill,
                    {
                      width: `${Math.max(
                        20,
                        (5 - passwordErrors.length) * 20
                      )}%`,
                      backgroundColor:
                        passwordErrors.length === 0
                          ? "#5CA377"
                          : passwordErrors.length <= 2
                          ? "#FFA500"
                          : "#FF6B6B",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.passwordStrengthText,
                  {
                    color:
                      passwordErrors.length === 0
                        ? "#5CA377"
                        : passwordErrors.length <= 2
                        ? "#FFA500"
                        : "#FF6B6B",
                  },
                ]}
              >
                {passwordErrors.length === 0
                  ? "Strong"
                  : passwordErrors.length <= 2
                  ? "Medium"
                  : "Weak"}
              </Text>
            </View>
          )}

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
                  onPress={() => setShowTermsOfService(true)}
                >
                  Terms of Service
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
            style={[
              styles.button,
              (!isFormValid() || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading && !showPrivacyPolicy && !showTermsOfService ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.googleButton,
              (!acceptedTerms || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={!acceptedTerms || isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <GoogleLogo style={styles.oauthLogo} />
              {isLoading && !showPrivacyPolicy && !showTermsOfService ? (
                <ActivityIndicator size="small" color="#1B1212" />
              ) : (
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* GitHub Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.githubButton,
              (!acceptedTerms || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleGitHubSignUp}
            disabled={!acceptedTerms || isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <GitHubLogo style={styles.oauthLogo} />
              {isLoading && !showPrivacyPolicy && !showTermsOfService ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.githubButtonText}>Sign up with GitHub</Text>
              )}
            </View>
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

      <DocumentModal
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="Privacy Policy"
        content={PrivacyPolicyContent}
      />

      <DocumentModal
        visible={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
        title="Terms of Service"
        content={TermsOfServiceContent}
      />
    </SafeAreaView>
  );
};

export default Register;
