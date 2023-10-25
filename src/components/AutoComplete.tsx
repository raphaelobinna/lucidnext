import { useFormulaStore } from "@/store/zustand";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";

type SuggestIndex = {
  name: string;
  category: string;
  value: number;
  id: string;
};

const AutocompleteInput = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [lastOperand, setLastOperand] = useState<string>("");
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);

  const { suggestion, getSuggestion } = useFormulaStore();

  useEffect(() => {
    getSuggestion();
  }, []);

  const operandsRegex: RegExp = /[()+\-*/&]/;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { trimmedInput, lastOperand } = trimInputAfterLastOperand(
      event.target.value
    );
    setInputValue(event.target.value);
    setLastOperand(lastOperand);
  };

  const trimInputAfterLastOperand = (
    input: string
  ): { trimmedInput: string; lastOperand: string } => {
    const lastOperandIndex: number = input.search(operandsRegex);

    if (lastOperandIndex !== -1) {
      const trimmedInput: string = input.substring(lastOperandIndex + 1);
      const lastOperand: string = input.substring(
        lastOperandIndex,
        lastOperandIndex + 1
      );
      return { trimmedInput, lastOperand };
    }
    return { trimmedInput: input, lastOperand: "" };
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === " " && inputValue.trim() !== "") {
      setTags([...tags, lastOperand, inputValue.trim()]);
      setInputValue("");
      setLastOperand("");
    }
  };

  const handleSuggestionClick = (suggestion: string): void => {
    if (lastOperand) {
      setTags([...tags, lastOperand, suggestion]);
    } else {
      setTags([...tags, suggestion]);
    }
    setInputValue("");
    setLastOperand("");
  };

  const handleTagRemove = (tag: string): void => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagClick = (index: number): void => {
    setEditingTagIndex(index);
  };

  const handleTagEditBlur = (): void => {
    setEditingTagIndex(null);
  };

  const handleTagEditChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const updatedTags: string[] = [...tags];
    updatedTags[index] = event.target.value;
    if (event.target.value == "") {
      setTags(tags.filter((t, i) => i !== index));
      return;
    }
    setTags(updatedTags);
  };

  useEffect(() => {
    if (editingTagIndex !== null && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [editingTagIndex]);

  const calculate = () => {
    try {
      const result = eval(tags.join(" "));

      return result;
    } catch (error) {
      // Handle error when the expression is not valid
      console.error("Invalid expression");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h4 className="text-green-600 text-xl font-bold">{calculate()}</h4>

      <div className="flex flex-row border border-gray-300">
        <div className="flex flex-wrap">
          {tags.map((tag, index) => (
            <div
              key={index}
              className={`p-2 items-center flex flex-row rounded-md ${
                /[+\-*/&]/.test(tag) ? "bg-transparent" : "bg-gray-300  w-16"
              }`}
            >
              {editingTagIndex === index ? (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tag}
                  onBlur={handleTagEditBlur}
                  onChange={(event) => handleTagEditChange(event, index)}
                  className="border-none bg-transparent outline-none"
                />
              ) : (
                <>
                  <div onClick={() => handleTagClick(index)}>{tag}</div>

                  <button onClick={() => handleTagRemove(tag)} className="ml-2">
                    {!operandsRegex.test(tag) && (
                      <p className="text-red-600 text-md font-bold">{"X"}</p>
                    )}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          //   onKeyDown={handleKeyDown}
          placeholder="Type something..."
          className=" p-2 rounded-md mb-4 focus:outline-none focus:border-gray-400 bg-transparent"
        />
      </div>

      {inputValue && (
        <div className="w-64 bg-white border border-gray-300 rounded-md p-4 shadow">
          {suggestion
            .filter((suggestion) =>
              suggestion.name
                .toLowerCase()
                .includes(
                  trimInputAfterLastOperand(inputValue.toLowerCase())
                    .trimmedInput
                )
            )
            .map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="cursor-pointer hover:bg-gray-100 rounded p-2 mb-2"
              >
                {suggestion.name}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
