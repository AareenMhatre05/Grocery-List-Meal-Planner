import { screen } from "@testing-library/react";
import App from "../App";
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

test("renders login or home page", () => {
  render(<App />);
  const linkElement = screen.getByText(/login/i);
  expect(linkElement).toBeInTheDocument();
});
