import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExcelSplitter.css";

function ExcelSplitter() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [headerRow, setHeaderRow] = useState(0);
  const [status, setStatus] = useState("");

  // shared inspect helper — reused by file change, sheet change, and header row change
  async function inspectFile(pickedFile, sheet = null, header = 0) {
    const formData = new FormData();
    formData.append("file", pickedFile);
    if (sheet) formData.append("sheet", sheet);
    formData.append("header_row", header);

    const res = await fetch("http://127.0.0.1:8000/api/inspect", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Could not read file");
    return await res.json();
  }

  // Step 1 — file picked
  async function handleFileChange(e) {
    const pickedFile = e.target.files[0];
    if (!pickedFile) return;

    setFile(pickedFile);
    setStatus("Reading file structure...");
    setSheets([]);
    setColumns([]);
    setSelectedSheet("");
    setSelectedColumn("");
    setHeaderRow(0);

    try {
      const data = await inspectFile(pickedFile);
      setSheets(data.sheets);
      setColumns(data.columns);
      setSelectedSheet(data.sheets[0]);
      setSelectedColumn(data.columns[0]);
      setStatus("File loaded ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error reading file ❌");
    }
  }

  // Step 2 — user switches sheet
  async function handleSheetChange(e) {
    const sheet = e.target.value;
    setSelectedSheet(sheet);
    setSelectedColumn("");
    setStatus("Loading columns...");

    try {
      const data = await inspectFile(file, sheet, headerRow);
      setColumns(data.columns);
      setSelectedColumn(data.columns[0]);
      setStatus("Sheet loaded ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error loading sheet ❌");
    }
  }

  // Step 3 — user changes header row
  async function handleHeaderRowChange(e) {
    const header = Number(e.target.value);
    setHeaderRow(header);
    setSelectedColumn("");
    setStatus("Reloading columns...");

    try {
      const data = await inspectFile(file, selectedSheet, header);
      setColumns(data.columns);
      setSelectedColumn(data.columns[0]);
      setStatus("Columns updated ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error reloading columns ❌");
    }
  }

  // Step 4 — split it
  async function handleUpload() {
    if (!file || !selectedSheet || !selectedColumn) {
      setStatus("Pick a file, sheet, and column first ❌");
      return;
    }

    setStatus("Processing your Excel file...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("split_column", selectedColumn);
    formData.append("sheet", selectedSheet);
    formData.append("header_row", headerRow);
    formData.append("header_color", "#a855f7");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/split", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setStatus(`Error: ${errorData.detail || "Upload failed"}`);
        return;
      }

      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "split_files.zip";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replaceAll('"', "");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus("Done! File downloaded ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error connecting to backend ❌");
    }
  }

  return (
    <div className="workspace-view animate-fade">
      <button onClick={() => navigate("/")} className="back-btn">
        ← Back to Dashboard
      </button>

      <div className="workspace-panel">
        <div className="panel-header">
          <h2>Excel Splitter</h2>
          <p>
            Segment massive workbook registries into individual standalone files
            dynamically by unique column criteria.
          </p>
        </div>

        {/* File upload */}
        <div className="form-group">
          <label className="field-label">Choose Excel File</label>
          <div className="file-upload-zone">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="file-input-hidden"
              id="excel-file"
            />
            <label htmlFor="excel-file" className="file-upload-label">
              {file ? `📄 ${file.name}` : "Click to browse or drop file here"}
            </label>
          </div>
        </div>

        {/* Sheet picker — only shows if file has multiple sheets */}
        {sheets.length > 1 && (
          <div className="form-group">
            <label className="field-label">Select Sheet</label>
            <select
              value={selectedSheet}
              onChange={handleSheetChange}
              className="tech-select"
            >
              {sheets.map((sheet, idx) => (
                <option key={idx} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Header row picker — only shows once file is loaded */}
        {sheets.length > 0 && (
          <div className="form-group">
            <label className="field-label">Header Row</label>
            <select
              value={headerRow}
              onChange={handleHeaderRowChange}
              className="tech-select"
            >
              <option value={0}>Row 1 (default)</option>
              <option value={1}>Row 2</option>
              <option value={2}>Row 3</option>
            </select>
          </div>
        )}

        {/* Column picker */}
        <div className="form-group">
          <label className="field-label">Split By Column</label>
          {columns.length > 0 ? (
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="tech-select"
            >
              {columns.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Upload a spreadsheet to load columns..."
              disabled
              className="tech-input"
            />
          )}
        </div>

        <button
          onClick={handleUpload}
          className="action-btn"
          disabled={!selectedColumn}
        >
          Execute Automation Split
        </button>

        {status && <p className="tech-status">{status}</p>}
      </div>
    </div>
  );
}

export default ExcelSplitter;
