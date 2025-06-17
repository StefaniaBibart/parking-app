# Parking App

This is a parking management application built with Angular. It allows administrators to manage the parking layout and user reservations, and users to reserve parking spots.

## Features

- **User and Admin Roles**: Different views and capabilities for regular users and administrators.
- **Parking Spot Management**: Admins can add, remove, and view parking spots.
- **Parking Reservations**: Users can view available spots and make reservations for a specific date or date range.
- **Dynamic Parking Layout**: The parking layout, including floors and spots per floor, can be configured by the admin.
- **Data Persistence**: Choose between using Firebase for real-time data storage or local browser storage for offline-first development.
- **Theming**: Includes a dark/light mode toggle for user preference.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (which includes npm)
- [Angular CLI](https://angular.dev/tools/cli) version 18.2.12 or higher
  ```bash
  npm install -g @angular/cli@18.2.12
  ```

## Dependencies

This project relies on several key dependencies. The major versions are:

### Core Dependencies

- Angular v18.2.0
- Angular Material & CDK v18.2.14
- Firebase v11.6.0
- RxJS v7.8.0

### Installing Dependencies

1. **Angular Material**

   ```bash
   ng add @angular/material@18.2.14
   ```

   During the installation, you'll be prompted to:

   - Choose a theme (or custom)
   - Set up global Angular Material typography styles
   - Set up browser animations for Angular Material

2. **Firebase**

   ```bash
   npm install firebase@11.6.0
   ```

3. **All Other Dependencies**
   ```bash
   npm install
   ```
   This will install all dependencies listed in package.json with their correct versions.

## Setup and Installation

Follow these steps to get the application running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd parking-app
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Configure Data Provider

This application can use either **Firebase** or **Local Storage** for data. You can configure this in `src/app/app.config.ts`.

Open `src/app/app.config.ts` and locate these lines:

```typescript
// src/app/app.config.ts

const DEFAULT_DATA_PROVIDER = DataProviderType.FIREBASE;
const PARKING_SPOT_PROVIDER = DataProviderType.FIREBASE; // or DataProviderType.LOCALSTORAGE
```

- To use **Firebase**, keep the values as `DataProviderType.FIREBASE`.
- To use **Local Storage**, change the values to `DataProviderType.LOCALSTORAGE`.

### 4. Firebase Configuration (if using Firebase)

If you are using the Firebase data provider, you need to set up a Firebase project.

#### a. Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click on "Add project" and follow the steps to create a new project.

#### b. Set up Realtime Database

1.  In your new Firebase project, go to the "Build" section in the left-hand menu and click on "Realtime Database".
2.  Click "Create Database".
3.  Choose a location for your database.
4.  Start in **test mode** for initial development (this allows read/write access without authentication). You can configure security rules later for production.
5.  You will get a `databaseURL` that looks something like this: `https://<your-project-id>-default-rtdb.firebaseio.com/`.

#### c. Get Firebase Web App Config

1.  In your Firebase project, go to "Project Settings" (the gear icon at the top of the left menu).
2.  In the "General" tab, scroll down to "Your apps".
3.  Click on the web icon (`</>`) to create a new web app.
4.  Give your app a nickname and click "Register app".
5.  Firebase will provide you with a `firebaseConfig` object. You only need the `apiKey`.

#### d. Configure the Application

1.  **API Key**:
    - In the `src/environments/` directory, create a new file named `environment.ts` (or modify the existing one).
    - Add your Firebase API key to this file. It should look like this:
      ```typescript
      // src/environments/environment.ts & environment.development.ts
      export const environment = {
        production: false,
        FIREBASE_AUTH_KEY: "YOUR_API_KEY_HERE",
      };
      ```
2.  **Database URL**:
    - Open `src/app/app.config.ts`.
    - Find the `firebaseConfig` object and replace the `databaseURL` with your Realtime Database URL.
      ```typescript
      // src/app/app.config.ts
      const firebaseConfig = {
        apiKey: environment.FIREBASE_AUTH_KEY,
        databaseURL: "https://<your-project-id>-default-rtdb.firebaseio.com/",
      };
      ```

### 5. Run the Application

You can start the development server in one of two ways:

```bash
npm start
```

or

```bash
ng serve
```

We recommend using `npm start` because:

- It uses the project's local Angular CLI version
- It's consistent across different projects
- It will automatically use any custom configurations defined in package.json
- It doesn't require global Angular CLI installation

The application will be available at `http://localhost:4200/`.
