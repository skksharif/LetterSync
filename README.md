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
