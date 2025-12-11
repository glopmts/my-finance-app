import { CategoryEnum } from "./transaction-props";

export type Category =
  | "transporte"
  | "alimentacao"
  | "hospedagem"
  | "entretenimento"
  | "saude"
  | "educacao"
  | "utilidades"
  | "investimentos"
  | "compras"
  | "outro";

export interface CategoryConfig {
  name: string;
  icon: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<CategoryEnum, CategoryConfig> = {
  TRANSPORTATION: {
    name: "Transporte",
    icon: "🚗",
    color: "#FF6B6B",
  },
  FOOD: {
    name: "Alimentação",
    icon: "🍽️",
    color: "#4ECDC4",
  },
  ACCOMMODATION: {
    name: "Hospedagem",
    icon: "🏨",
    color: "#FFD166",
  },
  ENTERTAINMENT: {
    name: "Entretenimento",
    icon: "🎬",
    color: "#06D6A0",
  },
  HEALTHCARE: {
    name: "Saúde",
    icon: "🩺",
    color: "#118AB2",
  },
  EDUCATION: {
    name: "Educação",
    icon: "📚",
    color: "#073B4C",
  },
  UTILITIES: {
    name: "Utilidades",
    icon: "💡",
    color: "#7209B7",
  },
  INVESTMENTS: {
    name: "Investimentos",
    icon: "💰",
    color: "#F72585",
  },
  SHOPPING: {
    name: "Compras",
    icon: "🛒",
    color: "#4361EE",
  },
  OTHER: {
    name: "Outro",
    icon: "❓",
    color: "#6C757D",
  },
};

export const CATEGORY_TO_KEY: Record<CategoryEnum, Category> = {
  TRANSPORTATION: "transporte",
  FOOD: "alimentacao",
  ACCOMMODATION: "hospedagem",
  ENTERTAINMENT: "entretenimento",
  HEALTHCARE: "saude",
  EDUCATION: "educacao",
  UTILITIES: "utilidades",
  INVESTMENTS: "investimentos",
  SHOPPING: "compras",
  OTHER: "outro",
};
