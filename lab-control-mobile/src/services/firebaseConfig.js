import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDueO6W3QY2E0jWgCP71vr8qPuaC30CrUA",
  authDomain: "labcontrol-30213.firebaseapp.com",
  projectId: "labcontrol-30213",
  storageBucket: "labcontrol-30213.firebasestorage.app",
  messagingSenderId: "757759301262",
  appId: "1:757759301262:web:72569364d41e359dee1bdf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);