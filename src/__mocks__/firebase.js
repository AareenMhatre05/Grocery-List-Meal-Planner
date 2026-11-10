// ✅ Mock Firebase Auth and Firestore
export const getAuth = jest.fn(() => ({}));
export const onAuthStateChanged = jest.fn((auth, callback) => {
  callback(null); // simulate no logged-in user
  return jest.fn(); // cleanup fn
});
export const createUserWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: "mockUser" } })
);
export const signInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: "mockUser" } })
);
export const signOut = jest.fn(() => Promise.resolve());

// ✅ Firestore
export const getFirestore = jest.fn(() => ({}));
export const doc = jest.fn();
export const setDoc = jest.fn(() => Promise.resolve());
