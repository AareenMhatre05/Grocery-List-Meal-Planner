// ✅ setupTests.js
import "@testing-library/jest-dom";

// --- 🔧 Simplified Mock for react-router-dom ---
import "@testing-library/jest-dom";


// --- 🔧 Mock Firebase ---
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "123", email: "test@example.com" } })
  ),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "123", email: "test@example.com" } })
  ),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ name: "Test User", email: "test@example.com" }),
    })
  ),
}));
