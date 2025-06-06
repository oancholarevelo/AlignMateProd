import React, { useState, useEffect } from "react";
import {
  // getAuth, // auth is imported from firebase.js
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  // signInWithPopup, // Replaced with signInWithCredential
  sendPasswordResetEmail,
  signInWithCredential, // Added for Google Sign-In
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Note: For React Native, consider React Navigation
import { ref, set, get, update } from "firebase/database"; // Added update
import { auth, database } from "../firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform, // For potential platform-specific logic if needed
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; // Import GoogleSignin

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLinkExpiry, setResetLinkExpiry] = useState(null);
  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    message: "",
  });
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider(); // No longer directly used for popup

  // Configure Google Sign In
  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: '32530267491-ks7jna6s3nd58pq7trl888kb7hpr3oo3.apps.googleusercontent.com',
        offlineAccess: false,
      });
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  // Enhanced email validation
  const validateEmail = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(emailToValidate);

    if (!emailToValidate) {
      setEmailValidation({ isValid: false, message: "Email is required" });
    } else if (!isValid) {
      setEmailValidation({
        isValid: false,
        message: "Please enter a valid email address",
      });
    } else {
      setEmailValidation({ isValid: true, message: "" });
    }
    return isValid;
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(resetEmail)) {
      return;
    }
    setIsLoading(true);
    try {
      // Note: window.location.origin might not be suitable for React Native.
      // Consider a deep link or a specific URL for your app.
      const actionCodeSettings = {
        // url: `${window.location.origin}/login?emailVerified=true`, // Example for web
        url: 'https://test-alignmate.firebaseapp.com/__/auth/action', // Replace with your actual URL or deep link
        handleCodeInApp: false, // Set to true if you handle the link in-app
      };
      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      setResetEmailSent(true);
      setCooldownTime(60);
      setResetLinkExpiry(Date.now() + 60 * 60 * 1000); // 1 hour from now
      Alert.alert(
        "🔐 Reset Email Sent!",
        `A secure password reset link has been sent to ${resetEmail}.\n\n` +
          "• Check your inbox and spam folder\n" +
          "• The link expires in 1 hour\n" +
          "• Click the link to set a new password\n\n" +
          "Still having trouble? Contact our support team.",
        [{ text: "Got it!", style: "default" }]
      );
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again.";
      let errorTitle = "❌ Error";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No AlignMate account found with this email address. Please check your email or create a new account.";
          errorTitle = "🔍 Account Not Found";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          errorTitle = "📧 Invalid Email";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many password reset attempts. Please wait a few minutes before trying again.";
          errorTitle = "⏰ Rate Limited";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection and try again.";
          errorTitle = "🌐 Connection Error";
          break;
        default:
          console.error("Password reset error:", error);
          break;
      }
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      setLoginError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setLoginError("");

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => { // made async
        const user = userCredential.user;
        setLoginError("");

        // NOTE: localStorage is for web. For React Native, use AsyncStorage.
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userEmail", user.email);

        const userRef = ref(database, `users/${user.uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.name) {
              localStorage.setItem("userName", userData.name);
            }
            // Update lastLogin
            await update(userRef, { // Changed from set to update to avoid overwriting other data
              lastLogin: new Date().toISOString(),
            });
          } else {
            // User exists in Auth but not in DB (should ideally not happen if registered correctly)
            await set(userRef, {
              email: user.email,
              name: "User", // Default name
              registrationDate: new Date().toISOString(), // Or first login
              lastLogin: new Date().toISOString(),
              authProvider: "email",
            });
          }
          // Write the UID to the global currentUserUID path for hardware detection
          await set(ref(database, "currentUserUID"), user.uid);

        } catch (dbError) {
          console.error("Error accessing or updating user data in DB:", dbError);
        }
        
        navigate("/app"); // Or your desired screen
      })
      .catch((error) => {
        let errorMessage = "Login failed. Please try again.";
        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email address.";
            break;
          case "auth/wrong-password":
          case "auth/invalid-password": // Deprecated, but good to keep
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/invalid-credential": // General error for wrong email/password
            errorMessage = "Invalid email or password. Please check your credentials.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please wait before trying again.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled. Please contact support.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your internet connection.";
            break;
          default:
            console.error("Login error:", error)
            errorMessage = `Login failed: ${error.message}`; // More specific error
            break;
        }
        setLoginError(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoginError("");

    if (Platform.OS === 'web') {
      // Web Google Sign-In
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("Google sign-in successful (Web)", user.uid);

        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.displayName || "Google User");

        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          await set(userRef, {
            email: user.email,
            name: user.displayName || "Google User",
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            authProvider: "google",
          });
        } else {
          await update(userRef, { lastLogin: new Date().toISOString() });
        }
        // Write the UID to the global currentUserUID path for hardware detection
        await set(ref(database, "currentUserUID"), user.uid);

        navigate("/app");
      } catch (error) {
        console.error("Google Sign In Error (Web)", error);
        setLoginError(`Google Sign-In Failed (Web): ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Native Google Sign-In
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const { idToken, user: googleUser } = await GoogleSignin.signIn();
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);
        const user = userCredential.user;

        console.log("Google sign-in successful (Native)", user.uid);

        // Use AsyncStorage for React Native instead of localStorage
        // await AsyncStorage.setItem("userUID", user.uid);
        // await AsyncStorage.setItem("userEmail", user.email);
        // await AsyncStorage.setItem("userName", user.displayName || googleUser.name || "Google User");
        // For now, using localStorage as per your existing code, but this should be AsyncStorage
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.displayName || googleUser.name || "Google User");


        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          await set(userRef, {
            email: user.email,
            name: user.displayName || googleUser.name || "Google User",
            registrationDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            authProvider: "google",
          });
        } else {
          await update(userRef, { lastLogin: new Date().toISOString() });
        }
        // Write the UID to the global currentUserUID path for hardware detection
        await set(ref(database, "currentUserUID"), user.uid);

        navigate("/app");
      } catch (error) {
        let message = "Google Sign-In failed. Please try again.";
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          message = "Google Sign-In was cancelled.";
        } else if (error.code === statusCodes.IN_PROGRESS) {
          message = "Google Sign-In is already in progress.";
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          message = "Google Play services not available or outdated. Please update them.";
          Alert.alert("Play Services Error", message);
        } else {
          console.error("Google Sign In Error (Native)", error);
          message = `Google Sign-In Error: ${error.message || error.code}`;
          Alert.alert("Google Sign-In Error", message);
        }
        setLoginError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetEmailSent(false);
    setCooldownTime(0);
    setEmailValidation({ isValid: true, message: "" }); // Reset validation
  };

  const renderForgotPasswordForm = () => (
    <View style={styles.forgotPasswordContainer}>
      {/* Header with Icon */}
      <View style={styles.forgotPasswordHeader}>
        <Svg
          width={60}
          height={60}
          viewBox="0 0 24 24"
          style={styles.forgotPasswordIcon}
        >
          <Path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z"
            fill="#5CA377"
          />
        </Svg>
        <Text style={styles.forgotPasswordTitle}>Reset Password</Text>
        <Text style={styles.forgotPasswordSubtitle}>
          Don't worry! We'll help you get back into your account.
        </Text>
      </View>

      <View style={styles.forgotPasswordCard}>
        <Text style={styles.forgotPasswordText}>
          Enter your email address and we'll send you a secure link to reset
          your password.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.forgotPasswordInput,
              !emailValidation.isValid && styles.inputError,
            ]}
            placeholder="Enter your email address"
            placeholderTextColor="#666666"
            value={resetEmail}
            onChangeText={(text) => {
              setResetEmail(text);
              if (text) validateEmail(text); // Validate as user types
              else setEmailValidation({ isValid: true, message: "" }); // Clear error if empty
            }}
            onBlur={() => validateEmail(resetEmail)} // Validate on blur
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {!emailValidation.isValid && emailValidation.message ? ( // Check if message exists
            <Text style={styles.errorText}>{emailValidation.message}</Text>
          ) : null}
        </View>

        {resetEmailSent && (
          <View style={styles.successMessageContainer}>
            <Text style={styles.successMessageText}>
              🔐 Reset link sent successfully!
            </Text>
            <Text style={styles.successMessageSubtext}>
              Check your email inbox and spam folder
            </Text>
            {resetLinkExpiry && (
              <Text style={styles.expiryText}>
                Link expires in{" "}
                {Math.max(0, Math.ceil((resetLinkExpiry - Date.now()) / (1000 * 60)))}{" "}
                minutes
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.forgotPasswordButton,
            (isLoading || cooldownTime > 0 || !emailValidation.isValid || !resetEmail) && styles.disabledButton, // Disable if email invalid or empty
          ]}
          onPress={handleForgotPassword}
          disabled={isLoading || cooldownTime > 0 || !emailValidation.isValid || !resetEmail}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.forgotPasswordButtonText}>Sending...</Text>
            </View>
          ) : cooldownTime > 0 ? (
            <View style={styles.cooldownContainer}>
              <Text style={styles.forgotPasswordButtonText}>
                Sent! Wait {cooldownTime}s
              </Text>
            </View>
          ) : (
            <Text style={styles.forgotPasswordButtonText}>
              {resetEmailSent ? "Send Again" : "Send Reset Link"}
            </Text>
          )}
        </TouchableOpacity>

        {cooldownTime > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((60 - cooldownTime) / 60) * 100}%` },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>🔐 Password Reset Guide</Text>
        <View style={styles.instructionsList}>
          <Text style={styles.instructionItem}>
            • 📧 Check your email inbox for the reset link
          </Text>
          <Text style={styles.instructionItem}>
            • 🗂️ Look in spam/junk folder if not in inbox
          </Text>
          <Text style={styles.instructionItem}>
            • ⏰ Use the link within 1 hour (it expires for security)
          </Text>
          <Text style={styles.instructionItem}>
            • 🔒 Create a strong, unique password
          </Text>
          <Text style={styles.instructionItem}>
            • 🔑 Return here to login with your new password
          </Text>
        </View>

        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            💡 Still having trouble? Contact our support team for assistance.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backToLoginButton}
        onPress={resetForgotPasswordForm}
      >
        <Text style={styles.backToLoginText}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginForm = () => (
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

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setLoginError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setLoginError("");
        }}
        secureTextEntry
      />

      {loginError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessageText}>{loginError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, (isLoading || !email || !password) && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading || !email || !password}
      >
        <Text style={styles.buttonText}>
          {isLoading && !showForgotPassword ? "Signing In..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, isLoading && styles.disabledButton]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.googleButtonText}>
          {isLoading && !showForgotPassword ? "Connecting..." : "Sign in with Google"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPasswordLink}
        onPress={() => {
          setShowForgotPassword(true);
          setLoginError(""); // Clear login error when switching to forgot password
        }}
      >
        <Text style={styles.forgotPasswordLinkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 14, color: "#1B1212" }}>
          Don't have an account?{" "}
          <Text
            style={{ color: "#5CA377", fontWeight: "bold" }}
            onPress={() => navigate("/register")}
          >
            Register
          </Text>
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
      </ScrollView>
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
    backgroundColor: "#FFFFFF",
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
  disabledButton: {
    opacity: 0.6,
  },
  forgotPasswordLink: {
    marginBottom: 8,
  },
  forgotPasswordLinkText: {
    fontSize: 14,
    color: "#5CA377",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  forgotPasswordContainer: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  forgotPasswordHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  forgotPasswordIcon: {
    marginBottom: 16,
  },
  forgotPasswordTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B1212",
    marginBottom: 8,
    textAlign: "center",
  },
  forgotPasswordSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  forgotPasswordCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(27, 18, 18, 0.1)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: "#1B1212",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPasswordInput: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#1B1212",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1212",
    backgroundColor: "#FAF9F6",
  },
  successMessageContainer: {
    backgroundColor: "rgba(92, 163, 119, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#5CA377",
  },
  successMessageText: {
    fontSize: 16,
    color: "#5CA377",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  successMessageSubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
  },
  forgotPasswordButton: {
    width: "100%",
    backgroundColor: "#5CA377",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1B1212",
    alignItems: "center",
    marginBottom: 12,
  },
  forgotPasswordButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cooldownContainer: {
    alignItems: "center",
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(27, 18, 18, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5CA377",
    borderRadius: 2,
  },
  instructionsCard: {
    width: "100%",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1212",
    marginBottom: 16,
    textAlign: "center",
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    fontWeight: "500",
  },
  backToLoginButton: {
    padding: 12,
  },
  backToLoginText: {
    fontSize: 16,
    color: "#5CA377",
    fontWeight: "700",
    textAlign: "center",
  },
  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "rgba(231, 76, 60, 0.05)",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  expiryText: {
    fontSize: 12,
    color: "#f39c12",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600",
  },
  supportContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(92, 163, 119, 0.05)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#5CA377",
  },
  supportText: {
    fontSize: 13,
    color: "#5CA377",
    textAlign: "center",
    fontWeight: "500",
    fontStyle: "italic",
  },
  errorContainer: {
    width: "80%",
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  errorMessageText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Login;