// Import React dependencies.
import React, { useState } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

// Define the initial value of the Slate editor.
const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Lets begin to write..." }],
  },
];

// Define the Slate editor component. This component will use the Slate editor factory and render the Slate editor.
const SlateEditor = ({ onSave }) => {
  const [editor] = useState(() => withReact(createEditor()));
  return (
    // Add the editable component inside the context.
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        onKeyDown={(event) => {
          if (event.key === "&") {
            // Prevent the ampersand character from being inserted.
            event.preventDefault();
            // Execute the `insertText` method when the event occurs.
            editor.insertText("and");
          }
        }}
      />
    </Slate>
  );
};

export default SlateEditor;
