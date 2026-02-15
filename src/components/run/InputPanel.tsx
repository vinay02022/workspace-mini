"use client";

import { TextArea } from "@/components/ui/TextArea";

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function InputPanel({ value, onChange }: InputPanelProps) {
  return (
    <div>
      <TextArea
        label="Input Text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your text here..."
        rows={8}
      />
      <p className="mt-1 text-xs text-gray-500">
        {value.length} characters
      </p>
    </div>
  );
}
