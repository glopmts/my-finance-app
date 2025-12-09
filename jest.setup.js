import "@testing-library/jest-native/extend-expect";

// eslint-disable-next-line no-undef
jest.mock("expo-router", () => ({
  // eslint-disable-next-line no-undef
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
