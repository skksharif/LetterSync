import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { ToastContainer, toast } from 'react-toastify';
import "./Login.css";
import DraftEditor from "./DraftEditor";

export default function Login() {
  const [user, setUser] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Attempt to retrieve the access token from the current user
        user.getIdTokenResult().then((tokenResult) => {
          const accessToken = user.accessToken || tokenResult.accessToken;
          if (accessToken) {
            setGoogleAccessToken(accessToken);
          }
        });
        toast.success("You are already logged in");
      } else {
        setUser(null);
        setGoogleAccessToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const googleLogin = async () => {
    await auth.signOut(); // Ensure the user is signed out before login

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken; // Google OAuth 2.0 access token
      setUser(user);
      setGoogleAccessToken(accessToken);
      console.log("Google Access Token from Login:", accessToken); // Debug
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    }
  };

  const getAccessToken = async () => {
    if (!user || !googleAccessToken) {
      toast.error("No valid session. Please sign in again.");
      return null;
    }

    try {
      // Check if the token is still valid by making a lightweight API call or refreshing it
      const response = await fetch("https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + googleAccessToken);
      if (!response.ok) {
        // Token might be expired, refresh it
        const refreshedUser = auth.currentUser;
        const tokenResult = await refreshedUser.getIdTokenResult(true);
        const newCredential = GoogleAuthProvider.credentialFromResult({ user: refreshedUser, _tokenResponse: tokenResult });
        const newAccessToken = newCredential.accessToken || refreshedUser.accessToken;
        setGoogleAccessToken(newAccessToken);
        console.log("Refreshed Google Access Token:", newAccessToken); // Debug
        return newAccessToken;
      }
      console.log("Current Google Access Token:", googleAccessToken); // Debug
      return googleAccessToken;
    } catch (error) {
      console.error("Error validating or refreshing access token:", error);
      toast.error("Session expired. Please sign in again.");
      return null;
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null);
      setGoogleAccessToken(null);
    });
  };

  const uploadFileToDrive = async (file) => {
    const token = await getAccessToken();
    if (!token) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    try {
      const folderName = "LettersByLetterSync";
      let folderId = await getFolderIdByName(folderName, token);

      if (!folderId) {
        folderId = await createFolder(folderName, token);
      }

      const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [folderId],
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", file);

      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error.message}`);
      }

      const data = await response.json();
      toast.success("File uploaded successfully to Google Drive.");
      console.log("File ID:", data.id);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  };

  const getFolderIdByName = async (folderName, token) => {
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch folder: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log("Folder search response:", data); // Debug
    if (!data.files || !Array.isArray(data.files)) {
      console.warn("No files array in response:", data);
      return null;
    }

    return data.files.length > 0 ? data.files[0].id : null;
  };

  const createFolder = async (folderName, token) => {
    const metadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create folder: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.id;
  };

  return (
    <>
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✍️</span> LetterSync
        </div>
        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="google-login-btn" onClick={googleLogin}>
            SignIn
          </button>
        )}
      </nav>

      {user ? (
        <div className="user-dashboard">
          <div className="welcome-section">
            <h1>Welcome, {user.displayName}!</h1>
            <p>Start crafting your letters with ease.</p>
          </div>
          <div className="editor-container">
            <DraftEditor getAccessToken={getAccessToken} uploadFileToDrive={uploadFileToDrive} />
          </div>
        </div>
      ) : (
        <div className="hero-section">
          <div className="hero-content">
            <h1>LetterSync</h1>
            <p className="tagline">
              Write, edit, and share letters effortlessly with a modern, intuitive editor.
            </p>
            <div className="login-btn-container">
              <button className="google-login-btn" onClick={googleLogin}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" />
                Sign in with Google
              </button>
            </div>
          </div>
          <div className="hero-background">
            <div className="gradient-overlay"></div>
          </div>
        </div>
      )}
      
    </div>
    <ToastContainer />
    </>
  );
}