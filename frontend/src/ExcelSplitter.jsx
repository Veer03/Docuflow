import { useState } from "react";
import "./ExcelSplitter.css";

function ExcelSplitter({ onBack }) {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]); // Dynamic columns array
  const [selectedColumn, setSelectedColumn] = useState("");
  const [headerColor, setHeaderColor] = useState("#2e7d32");
  const [status, setStatus] = useState("");

  // Triggered instantly when a file is picked
  async function handleFileChange(e) {
    const pickedFile = e.target.files[0];
    if (!pickedFile) return;

    setFile(pickedFile);
    setStatus("Reading sheet columns...");
    setColumns([]);
    setSelectedColumn("");

    const formData = new FormData();
    formData.append("file", pickedFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/columns", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setStatus("Could not read columns from this file ❌");
        return;
      }

      const data = await res.json();
      //here!
      setColumns(data.columns);

      if (data.columns.length > 0) {
        setSelectedColumn(data.columns[0]);
      }
      setStatus("File loaded successfully! Select a column below. ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error fetching spreadsheet metadata");
    }
  }

  async function handleUpload() {
    if (!file || !selectedColumn) {
      setStatus("Pick a file and a split column first ❌");
      return;
    }

    setStatus("Processing your Excel file...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("split_column", selectedColumn);
    formData.append("header_color", headerColor);

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

      setStatus("Done! File downloaded successfully ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error connecting to backend");
    }
  }

  return (
    <div className="splitter-container">
      <button onClick={onBack} className="back-btn">
        ← Back to Dashboard
      </button>

      <h2>Excel Splitter</h2>

      <div className="form-group">
        <label>Choose Excel File:</label>
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
      </div>

      <div className="form-group">
        <label>Target Split Column:</label>
        {columns.length > 0 ? (
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="text-input"
            style={{ padding: "6px", cursor: "pointer" }}
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
            placeholder="Upload a file to see columns..."
            disabled
            className="text-input"
          />
        )}
      </div>

      <div className="form-group-color">
        <label>Header Theme Color:</label>
        <div className="color-picker-row">
          <input
            type="color"
            value={headerColor}
            onChange={(e) => setHeaderColor(e.target.value)}
            className="color-input"
          />
          <code>{headerColor}</code>
        </div>
      </div>

      <button
        onClick={handleUpload}
        className="submit-btn"
        disabled={!selectedColumn}
      >
        Split it
      </button>

      <p className="status-text">{status}</p>
    </div>
  );
}

export default ExcelSplitter;
