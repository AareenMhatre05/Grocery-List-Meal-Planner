import { screen, fireEvent } from "@testing-library/react";
import Login from "../components/Login";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
jest.mock("../firebase"); // 👈 tells Jest to use __mocks__/firebase.js

// ✅ ESM-safe mock
jest.mock("react-router-dom", () => {
  return {
    useNavigate: jest.fn(() => jest.fn()),
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
    Navigate: () => <div>Navigate</div>,
  };
});

// 👇 import your component after the mock
import App from "../App";

// ✅ Mock Firebase
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

describe("Login Component", () => {
  test("renders login form", () => {
    render(<Login />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("calls Firebase login on submit", async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { email: "test@example.com" } });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "123456" } });
    fireEvent.click(screen.getByText(/login/i));

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });
});
