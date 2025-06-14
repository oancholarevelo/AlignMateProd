# AlignMate: A Smart Posture Monitoring and Correction System

**AlignMate** is an innovative web application developed as a thesis project for the Polytechnic University of the Philippines. It leverages a custom IMU (Inertial Measurement Unit) sensor to provide real-time posture analysis, personalized feedback, and gamified achievements to help users improve their postural habits.

This is not just a data logger; it's a comprehensive ecosystem featuring a dynamic user dashboard, a personalized calibration system, machine-learning-driven insights, and detailed data reporting.

**Live Application:** [**https://alignmate.vercel.app/**](https://www.google.com/search?q=https://alignmate.vercel.app/)

## ✨ Key Features

AlignMate is packed with features designed to create an engaging and effective posture correction experience:

  * **Real-Time Posture Monitoring:**

      * Live data streaming from a hardware sensor (ESP32 with IMU).
      * Visual feedback on posture status (Good, Warning, Bad) based on pitch angle.
      * Dynamic notifications to alert users of poor posture.

  * **Intelligent Calibration System:**

      * A guided, multi-step process (Upright, Slight Slouch, Severe Slouch) to train a personalized machine learning model.
      * Real-time logs from the device are displayed to the user during calibration.
      * Option to use a sensitive, pre-configured default model for immediate use.

  * **Interactive Dashboard:**

      * Displays aggregated posture data in hourly blocks with a clickable bar chart for detailed analysis.
      * Summarizes daily performance with Good vs. Poor posture percentages.
      * Tracks 7-day posture trends in a stacked bar chart, showing daily progress.

  * **Gamified Achievements & Progression:**

      * Users earn points and rewards for maintaining good posture.
      * Multiple themes to choose from (`Pet Care`, `City Builder`, `Posture Warrior`, `Space Explorer`, `Eco Warrior`), each with unique milestones.
      * Features animated rewards, progress visualizations, and an "Adventure" selection interface.

  * **In-Depth Analysis & Reporting:**

      * **Posture Detail View:** Provides ESP32-powered ML analysis, targeted recommendations, and specific exercises based on posture data.
      * **History Detail View:** Offers a day-by-day breakdown of performance, including ML decision factors, posture stability scores, and trend analysis against previous days.
      * **PDF Data Export:** Users can generate and download a comprehensive daily report including charts, logs, and ML insights.

  * **User Authentication & Management:**

      * Secure user registration and login with email/password.
      * OAuth integration for seamless sign-up/sign-in with **Google** and **GitHub**.
      * Features like "Forgot Password" and profile management (name/picture updates).

  * **Research & Feedback System:**

      * A comprehensive, multi-step research questionnaire to gather qualitative and quantitative feedback on the system's effectiveness, usability, reliability, and more.
      * An integrated "Contact Us" form for bug reports, feature requests, and general support.

## 🛠️ Technology Stack

This project integrates a modern web frontend with a real-time backend to deliver a seamless user experience.

  * **Frontend:**
      * **React.js**: For building the user interface.
      * **React Native for Web**: Components like `View`, `Text`, and `StyleSheet` are used, suggesting a cross-platform approach adapted for the web.
      * **React Router**: For navigation within the application.
  * **Backend & Database:**
      * **Google Firebase**: Used for Realtime Database, user authentication (Auth), and hosting.
  * **Data Visualization:**
      * **react-native-chart-kit**: For creating the bar, stacked bar, and line charts on the dashboard.
  * **PDF Generation:**
      * **jsPDF** & **jspdf-autotable**: To generate and export user data reports.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm (or yarn) installed on your machine.

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/AlignMate.git
    cd AlignMate
    ```

2.  **Install NPM packages:**

    ```sh
    npm install
    ```

3.  **Set up Firebase:**

      * Create a Firebase project at [https://firebase.google.com/](https://firebase.google.com/).
      * Enable **Authentication** (Email/Password, Google, GitHub providers).
      * Enable the **Realtime Database**.
      * Get your Firebase configuration object and place it in `src/firebase.js`. It should look like this:
        ```javascript
        import { initializeApp } from "firebase/app";
        import { getAuth } from "firebase/auth";
        import { getDatabase } from "firebase/database";

        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          databaseURL: "YOUR_DATABASE_URL",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
        };

        const app = initializeApp(firebaseConfig);
        export const auth = getAuth(app);
        export const database = getDatabase(app);
        ```

4.  **Run the application:**

    ```sh
    npm start
    ```

    This will open the application in your default web browser at `http://localhost:3000`.

## 📂 Project Structure

The project's components are well-organized, with each file representing a key feature or view of the application.

```
components/
├── Achievements.js         # Gamification and rewards screen
├── Calibration.js          # IMU sensor calibration flow
├── ContactUs.js            # User support and feedback form
├── DataExport.js           # Logic for generating PDF reports
├── DocumentRenderer.js     # Renders markdown for legal documents
├── HistoryDetail.js        # Detailed view for a specific day's history
├── Login.js                # User login component
├── Logout.js               # Logout functionality
├── LogViewer.js            # Displays real-time logs from the sensor
├── PostureDetail.js        # In-depth analysis of a posture reading
├── PostureGraph.js         # The main dashboard and hub component
├── PostureNotification.js  # Popup notification for poor posture
├── PrivacyPolicy.js        # Content for the privacy policy
├── Register.js             # User registration component
├── ResearchForm.js         # Multi-step research questionnaire
├── TermsOfService.js       # Content for the terms of service
└── ...and more
```

## ✍️ Authors

This project was developed by a dedicated team of students from the Polytechnic University of the Philippines:

  * **Oliver A. Revelo**
  * **Vic Arnie E. Aling**
  * **Jethro Delos Santos**
  * **Laurence Jian Noble**
  * **Andri Harvey Hoyumpa**

**Project Advisor:** Assoc. Prof. PCpE Jose Marie Dipay

## 📜 License

This project is distributed under the MIT License. See `LICENSE` for more information.
