# Vision Board

> _"The Wall of False Hope"_

A cross-platform (Web, iOS, Android) vision board application that leverages **Sarcastic Realism** to keep you grounded while you dream. Built with Expo, React Native, and Firebase.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone (for real device testing)
- A Firebase Project

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/vision-board.git
    cd vision-board
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

## Configuration

This project uses **Expo Environment Variables**.

1.  **Copy the example environment file:**

    ```bash
    cp .env.example .env.local
    ```

2.  **Update `.env.local` with your Firebase credentials:**
    Go to your [Firebase Console](https://console.firebase.google.com/) -> Project Settings and copy the configuration values.

    ```env
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

    > **Note:** Variables must start with `EXPO_PUBLIC_` to be potentially visible in the client-side code.

## Running the App

Start the development server:

```bash
npx expo start
```

- **Press `s`** to switch between development build and Expo Go.
- **Press `a`** to open on Android Emulator.
- **Press `i`** to open on iOS Simulator.
- **Press `w`** to open in the browser.
- **Scan the QR code** with your phone's camera (iOS) or Expo Go app (Android) to run on a physical device.

## Features

- **Cross-Platform**: Runs seamlessly on Web, iOS, and Android.
- **Cloud Sync**: Real-time data persistence with Firestore.
- **AI Milestones**: Generates sarcastic "realistic" action plans for your delusions.
- **Dark Mode**: Because dreaming is better in the dark.

## License

MIT
