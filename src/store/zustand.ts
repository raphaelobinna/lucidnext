import { create } from "zustand";

type Store = {
  suggestion: SuggestIndex[];
  getSuggestion: () => void;
};

type SuggestIndex = {
  name: string;
  category: string;
  value: string;
  id: string;
};

export const useFormulaStore = create<Store>((set) => ({
  suggestion: [],
  getSuggestion: async () => {
    const response = await fetch(
      "https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete"
    );
    set({ suggestion: await response.json() });
  },
}));
