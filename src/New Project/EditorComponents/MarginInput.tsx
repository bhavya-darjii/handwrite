import React from "react";

interface MarginInputProps {
  value: string;
  onChange: (val: string) => void;
  isFontLoading: boolean;
}

const MarginInput: React.FC<MarginInputProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="No."
      spellCheck={false}
      className="handwrite-prompt-box"
      style={{
        width: "50px",
        minWidth: "50px",
        height: "200px",
        resize: "none",

        // 👇 UPDATED: Adds the light border to Top, Left, and Bottom
        border: "1px solid rgba(255, 255, 255, 0.1)",

        // 👇 Adds a divider line in between the margin and the normal content
        // borderRight: "2px solid rgba(255, 255, 255, 0.2)",

        borderRadius: "8px 0 0 8px",
        outline: "none",
        backgroundColor: "rgba(255, 255, 255, 0.05)",

        color: "#ffffff",

        fontFamily: "inherit",
        fontSize: "1rem",
        lineHeight: "normal",
        textAlign: "center",
        padding: "11.5px 5px",
        overflowY: "hidden",
        whiteSpace: "pre",
        marginTop: "0px",
      }}
    />
  );
};

export default MarginInput;
