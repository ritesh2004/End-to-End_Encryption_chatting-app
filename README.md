# 📧 Real-Time End-to-End Encrypted Chat Application

A secure, real-time chat application built with **React.js**, **Node.js**, **Socket.io**, and **MySQL**. This project uses **end-to-end encryption** to ensure that messages are only readable by the intended recipients, providing a safe and private communication experience. Authentication is handled using **Firebase Google OAuth**, and the user interface is styled with **Tailwind CSS** and **Daisy UI**.

## Demo 
https://github.com/user-attachments/assets/42443db8-056e-442b-a1c9-9c2b8c837f35
## 🚀 Features
- **Real-Time Messaging**: Instant message delivery and updates using **Socket.io** for real-time bi-directional communication.
- **End-to-End Encryption**: 
  - Messages are encrypted using the **recipient’s public key** before being sent.
  - Only the recipient can decrypt the message using their **private key**, ensuring privacy and security.
  - Implemented with the **Forge** cryptography library.
- **Google Authentication**: 
  - Simple and secure authentication via **Firebase Google OAuth**, allowing users to sign in with their Google accounts.
- **Modern UI/UX**: 
  - Clean, responsive design with **React.js**, styled using **Tailwind CSS** and **Daisy UI**.
- **MySQL Database**: Efficient and structured data storage for managing chat histories.

## 🛠️ Technologies Used

- **Frontend**: 
  - [React.js](https://reactjs.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Daisy UI](https://daisyui.com/)

- **Backend**: 
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [Socket.io](https://socket.io/)

- **Database**:
  - [MySQL](https://www.mysql.com/)

- **Security**:
  - [Forge](https://github.com/digitalbazaar/forge) for end-to-end encryption

- **Authentication**: 
  - [Firebase Google OAuth](https://firebase.google.com/docs/auth)

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v14.x or higher)
- MySQL
- Firebase project with Google OAuth setup

### Steps to Install

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ritesh2004/End-to-End_Encryption_chatting-app.git
   cd End-to-End_Encryption_chatting-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add your configuration for:
   - Firebase credentials
   - MySQL database credentials
   - Socket.io configuration

   Example:
   ```bash
   DATABASE_HOST=localhost
   DATABASE_USER=root
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=chat_app_db
   ```

4. **Set up MySQL database:**

   Create a MySQL database and run the SQL scripts in the `/db` folder to create the required tables for user authentication and chat history.

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Build for production:**

   ```bash
   npm run build
   ```

## 🔒 How End-to-End Encryption Works

- **Public-Private Key Pair**: Each user has a public and private key. The public key is shared with other users, while the private key is kept secret.
- **Message Encryption**: Before sending a message, it is encrypted with the recipient's public key using the Forge library.
- **Message Decryption**: Upon receiving a message, the recipient uses their private key to decrypt and read the message.

This ensures that messages remain private and secure during transit.

## 🤝 Contributing

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature-branch-name`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Open a pull request.
