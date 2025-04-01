# LetterSync

**LetterSync** is a modern web application that allows users to write, edit, and share letters effortlessly with an intuitive editor. It integrates Google authentication and Google Drive to save documents.

## Key Technologies
- **React**: A JavaScript library for building user interfaces.
- **Firebase Authentication**: User authentication using Google Sign-In.
- **Google Drive API**: Integration with Google Drive to upload files.
- **Draft.js**: Rich text editor for crafting letters.
- **Toastify**: For displaying toast notifications.
- **CSS**: Styling for the user interface.
- **gapi**: Google's JavaScript API for interacting with Google services.

## Features
- Sign in with Google authentication.
- Write and edit letters using a rich text editor.
- Upload files to Google Drive (under a specific folder).
- Logout functionality.

## Installation Guide

### Prerequisites
- Node.js (>= 14.x)
- Firebase Project with Firebase Authentication enabled
- Google Cloud Project with OAuth 2.0 credentials (Client ID for Google Sign-In)
- Google Drive API enabled in the Google Cloud Project

### Steps to Set Up the Project Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lettersync.git
   cd lettersync
Install dependencies Run the following command to install the required dependencies.
npm install
2. **Set up Firebase**

- Create a Firebase project at Firebase Console.

- Enable Google Authentication under the "Authentication" section.

- Get your Firebase config details and create a firebase.js file in the src folder with the following content:

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
3. Set up Google Cloud

- Go to the Google Cloud Console.
- 
- Create a new project and enable the Google Drive API.

- Set up OAuth 2.0 credentials and copy your Client ID.

- Add the Client ID to the CLIENT_ID constant in Login.jsx.

4. Start the project After setting up Firebase and Google Cloud, you can start the project with:
npm start
Visit the App Open your browser and go to http://localhost:port. You should now be able to see the LetterSync app.

5. Project Structure

/src
  /components
    DraftEditor.js      # The rich text editor component (Draft.js)
    Login.js            # Google login, authentication, and Google Drive integration
  firebase.js           # Firebase configuration and initialization
  App.js                # Main App component
  index.js              # App entry point
  /styles
    Login.css           # Styles for the login and main page
