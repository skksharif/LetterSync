import React, { useState, useEffect, useRef } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faListUl,
  faListOl,
  faSave,
  faEdit,
  faTrash,
  faDownload,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import "./DraftEditor.css";

const DraftEditor = ({ getAccessToken, uploadFileToDrive }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const editorRef = useRef(null);
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    return savedContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      : EditorState.createEmpty();
  });
  const [drafts, setDrafts] = useState(
    () => JSON.parse(localStorage.getItem("drafts")) || []
  );

  useEffect(() => {
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
  }, [editorState]);

  // Add missing handleToolClick function
  const handleToolClick = (style, isBlock = false) => (e) => {
    e.preventDefault();
    if (isBlock) {
      setEditorState(RichUtils.toggleBlockType(editorState, style));
    } else {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    }
  };

  // Add missing handleDeleteDraft function
  const handleDeleteDraft = (id) => {
    const updatedDrafts = drafts.filter((draft) => draft.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
  };

  const handleSaveClick = () => setIsModalOpen(true);

  const saveDraft = (name) => {
    if (!name) return;
    const rawContent = convertToRaw(editorState.getCurrentContent());
    const newDraft = { id: Date.now(), name, content: rawContent };
    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
    setIsModalOpen(false);
  };

  const loadDraft = (draft) => {
    setEditorState(
      EditorState.createWithContent(convertFromRaw(draft.content))
    );
  };

  const generateDocxBlob = (rawContent) => {
    return new Promise((resolve) => {
      const contentState = convertFromRaw(rawContent);
      const blocks = contentState.getBlocksAsArray();

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: blocks.map((block) => {
              const text = block.getText();
              const blockType = block.getType();
              const inlineStyles = rawContent.blocks.find(
                (b) => b.key === block.getKey()
              ).inlineStyleRanges;

              let currentPos = 0;
              const runs = [];

              if (inlineStyles && inlineStyles.length > 0) {
                inlineStyles.forEach((style) => {
                  if (style.offset > currentPos) {
                    runs.push(
                      new TextRun(text.slice(currentPos, style.offset))
                    );
                  }
                  runs.push(
                    new TextRun({
                      text: text.slice(
                        style.offset,
                        style.offset + style.length
                      ),
                      bold: style.style === "BOLD",
                      italics: style.style === "ITALIC",
                      underline: style.style === "UNDERLINE" ? {} : undefined,
                    })
                  );
                  currentPos = style.offset + style.length;
                });
                if (currentPos < text.length) {
                  runs.push(new TextRun(text.slice(currentPos)));
                }
              } else {
                runs.push(new TextRun(text));
              }

              if (blockType === "unordered-list-item") {
                return new Paragraph({
                  children: runs,
                  bullet: { level: 0 },
                });
              } else if (blockType === "ordered-list-item") {
                return new Paragraph({
                  children: runs,
                  numbering: { reference: "my-numbering", level: 0 },
                });
              }
              return new Paragraph({
                children: runs,
              });
            }),
          },
        ],
        numbering: {
          config: [
            {
              reference: "my-numbering",
              levels: [
                {
                  level: 0,
                  format: "decimal",
                  text: "%1.",
                  alignment: "left",
                },
              ],
            },
          ],
        },
      });

      Packer.toBlob(doc).then((blob) => resolve(blob));
    });
  };

  const uploadToDrive = async (draft) => {
    try {
      const blob = await generateDocxBlob(draft.content);
      const file = new File([blob], `${draft.name || "document"}.docx`, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      await uploadFileToDrive(file);
    } catch (error) {
      console.error("Error uploading to Google Drive:", error);
      alert(`Failed to upload to Google Drive: ${error.message}`);
    }
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-container">
        <div className="editor-header">
          <div className="toolbar">
            <button
              className={`tool-button ${
                editorState.getCurrentInlineStyle().has("BOLD") ? "active" : ""
              }`}
              onMouseDown={handleToolClick("BOLD")}
            >
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button
              className={`tool-button ${
                editorState.getCurrentInlineStyle().has("ITALIC") ? "active" : ""
              }`}
              onMouseDown={handleToolClick("ITALIC")}
            >
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
              className={`tool-button ${
                editorState.getCurrentInlineStyle().has("UNDERLINE") ? "active" : ""
              }`}
              onMouseDown={handleToolClick("UNDERLINE")}
            >
              <FontAwesomeIcon icon={faUnderline} />
            </button>
            <button
              className={`tool-button ${
                RichUtils.getCurrentBlockType(editorState) === "unordered-list-item"
                  ? "active"
                  : ""
              }`}
              onMouseDown={handleToolClick("unordered-list-item", true)}
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>
            <button
              className={`tool-button ${
                RichUtils.getCurrentBlockType(editorState) === "ordered-list-item"
                  ? "active"
                  : ""
              }`}
              onMouseDown={handleToolClick("ordered-list-item", true)}
            >
              <FontAwesomeIcon icon={faListOl} />
            </button>
            <button className="tool-button save" onClick={handleSaveClick}>
              <FontAwesomeIcon icon={faSave} /> Save Draft
            </button>
          </div>
        </div>
        <div className="editor-content" onClick={() => editorRef.current?.focus()}>
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={(command, editorState) => {
              const newState = RichUtils.handleKeyCommand(editorState, command);
              if (newState) {
                setEditorState(newState);
                return "handled";
              }
              return "not-handled";
            }}
            placeholder="Start typing your masterpiece..."
          />
        </div>
      </div>
      <div className="drafts-sidebar">
        <h2>Drafts</h2>
        {drafts.length === 0 ? (
          <p className="no-drafts">No drafts yet. Start creating!</p>
        ) : (
          <div className="drafts-list">
            {drafts.map((draft) => (
              <div key={draft.id} className="draft-item">
                <span className="draft-name">
                  {draft.name || `Draft ${new Date(draft.id).toLocaleString()}`}
                </span>
                <div className="draft-actions">
                  <button className="action-btn edit" onClick={() => loadDraft(draft)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="action-btn download"
                    onClick={() => {
                      setFileName(draft.name);
                      generateDocxBlob(draft.content).then((blob) =>
                        saveAs(blob, `${draft.name || "document"}.docx`)
                      );
                    }}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                  <button
                    className="action-btn upload"
                    onClick={() => uploadToDrive(draft)}
                  >
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && (
        <FileNameModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveDraft}
        />
      )}
    </div>
  );
};

const FileNameModal = ({ isOpen, onClose, onSave }) => {
  const [fileName, setFileName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Save Your Draft</h3>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter draft name"
          className="modal-input"
        />
        <div className="modal-actions">
          <button
            className="modal-btn save"
            onClick={() => {
              onSave(fileName);
              setFileName("");
            }}
          >
            Save
          </button>
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftEditor;