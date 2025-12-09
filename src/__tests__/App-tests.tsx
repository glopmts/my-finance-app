import { render, screen } from "@testing-library/react-native";
import React from "react";
import Index from "../app/index";

test("renderiza o texto inicial", () => {
  render(<Index />);

  expect(screen.getByText("Olá mundo")).toBeTruthy();
});
