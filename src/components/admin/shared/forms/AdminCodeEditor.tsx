"use client";

import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useFormContext, Controller } from "react-hook-form";

interface AdminCodeEditorProps {
  name: string;
  label?: string;
}

export function AdminCodeEditor({ name, label }: AdminCodeEditorProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <div className="overflow-hidden border border-black/10 shadow-2xl">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <CodeMirror
              value={field.value || ""}
              height="400px"
              theme={vscodeDark}
              extensions={[css()]}
              onChange={(value) => {
                field.onChange(value);
              }}
              onBlur={field.onBlur}
              className="text-sm"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
