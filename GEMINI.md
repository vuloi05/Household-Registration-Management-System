# GEMINI Project Overview: Household Registration Management System

This document provides a comprehensive overview of the Household Registration Management System, designed to be used as a context for AI-driven development.

## 1. Project Purpose and Architecture

This is a full-stack mono-repo project that helps manage household registration information. It consists of four main, independent components:

*   **`backend`**: A Java Spring Boot API server that handles all business logic and database interactions.
*   **`frontend`**: A React & TypeScript single-page application (SPA) for the user interface.
*   **`mobile`**: A React Native & Expo mobile application.
*   **`ai-server`**: A Python Flask server that provides AI chatbot functionality, integrated with Ollama and Google Gemini.

### Technology Stack

| Component | Language/Framework | Key Dependencies |
| :--- | :--- | :--- |
| **Backend** | Java 21 / Spring Boot 3 | `spring-boot-starter-data-jpa`, `postgresql`, `spring-boot-starter-security`, `jjwt` |
| **Frontend** | React / TypeScript / Vite | `@mui/material`, `react-router-dom`, `axios`, `react-hook-form`, `zod` |
| **Mobile** | React Native / Expo | `@react-navigation/native`, `react-native-paper`, `axios`, `expo` |
| **AI Server** | Python 3.11+ / Flask | `flask`, `boto3`, `python-dotenv` |

## 2. Getting Started: Build and Run Commands

Here are the essential commands to get each part of the system running. For detailed setup, including database and environment variables, refer to `README.md`.

### a. Backend (Java API)

The backend is a standard Maven project.

*   **Prerequisites**: Java 21, Maven, PostgreSQL.
*   **Running the application**:
    ```bash
    # Navigate to the backend directory
    cd backend/api

    # Run the Spring Boot application
    ./mvnw spring-boot:run
    ```
*   **Building the application**:
    ```bash
    # Navigate to the backend directory
    cd backend/api

    # Package the application into a JAR file
    ./mvnw package
    ```

### b. Frontend (React Web App)

The frontend is a Vite-powered React application.

*   **Prerequisites**: Node.js 18+.
*   **Running the development server**:
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Run the development server
    npm run dev
    ```
*   **Building for production**:
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Build the application
    npm run build
    ```
*   **Linting**:
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Run the linter
    npm run lint
    ```

### c. Mobile (React Native App)

The mobile app is built with React Native and Expo.

*   **Prerequisites**: Node.js 18+, Expo CLI.
*   **Running the development server**:
    ```bash
    # Navigate to the mobile directory
    cd mobile

    # Install dependencies
    npm install

    # Start the Expo development server
    npm start
    ```
    You can then run the app on a simulator (`a` for Android, `i` for iOS) or on a physical device using the Expo Go app.

### d. AI Server (Python Flask)

The AI server is a Python Flask application.

*   **Prerequisites**: Python 3.11+.
*   **Running the server**:
    ```bash
    # Navigate to the ai-server directory
    cd ai-server

    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt

    # Run the Flask application
    python main.py
    ```

## 3. Development Conventions

*   **Code Style**: The project does not have a strictly enforced code style, but follow the existing conventions in each sub-project.
*   **Commits**: Commit messages should be clear and concise.
*   **Environment Variables**: Each sub-project (`backend`, `frontend`, `ai-server`) uses `.env` files for environment-specific configuration. Refer to the `README.md` for the required variables.
*   **API Communication**: The `frontend` and `mobile` applications communicate with the `backend` via RESTful APIs. The `axios` library is used for making HTTP requests.

This document should provide a solid starting point for any developer, human or AI, to understand and contribute to the project.
