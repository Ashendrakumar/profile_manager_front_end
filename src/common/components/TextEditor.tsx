import { Box, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export interface AppTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  theme?: "snow" | "bubble" | "core" | "";
  modules?: React.ComponentProps<typeof ReactQuill>["modules"];
  formats?: React.ComponentProps<typeof ReactQuill>["formats"];
  className?: string;
  style?: React.CSSProperties;
  isNormalField?: boolean;
}

const defaultModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    [{ script: "sub" }, { script: "super" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const defaultFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "script",
  "direction",
  "size",
  "color",
  "background",
  "font",
  "align",
  "link",
  "image",
  "video",
];

const TextEditorModules = {
  toolbar: [
    [{ header: [4, 5, 6, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
  ],
};

const TextEditor = ({
  value: controlledValue,
  onChange,
  placeholder = "Write something...",
  readOnly = false,
  theme = "snow",
  modules = defaultModules,
  formats = defaultFormats,
  className,
  style,
  isNormalField = false,
}: AppTextEditorProps) => {
  const appTheme = useTheme();

  const [value, setValue] = useState(controlledValue ?? "");

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (nextValue: string) => {
    if (controlledValue === undefined) {
      setValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <Box
      sx={{
        "& .ql-toolbar": {
          color: appTheme.palette.text.primary,
          borderRadius: "16px 16px 0 0",
        },

        "& .ql-container": {
          color: appTheme.palette.text.primary,
        },

        "& .ql-stroke": {
          stroke: appTheme.palette.text.primary,
        },

        "& .ql-fill": {
          fill: appTheme.palette.text.primary,
        },

        "& .ql-picker": {
          color: appTheme.palette.text.primary,
        },

        "& .ql-picker-options": {
          backgroundColor: appTheme.palette.background.paper,
        },

        "& .ql-picker-label": {
          color: appTheme.palette.text.primary,
        },

        "& .ql-picker-item": {
          color: appTheme.palette.text.primary,
        },

        "& .ql-picker.ql-expanded .ql-picker-label": {
          color: appTheme.palette.text.primary,
        },

        "& .ql-picker.ql-expanded svg path": {
          fill: appTheme.palette.text.primary,
        },

        "& .ql-picker.ql-expanded .ql-picker-options": {
          backgroundColor: appTheme.palette.background.paper,
        },
        "& .ql-editor.ql-blank": {
          color: appTheme.palette.text.primary,
        },
      }}
      className={`${className} my-text-editor`}
      style={style}
    >
      <ReactQuill
        theme={theme}
        value={controlledValue !== undefined ? controlledValue : value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={isNormalField ? TextEditorModules : modules}
        formats={formats}
        readOnly={readOnly}
      />
    </Box>
  );
};

export default TextEditor;
