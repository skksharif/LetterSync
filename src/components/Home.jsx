import React, { useState,useEffect } from "react";

import SlateEditor from "./SlateEditor";

export default function Home() {
  const [content, setContent] = useState("");

  return (
    <div>
      <SlateEditor/>
    </div>
  );
}
