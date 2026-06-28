import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExcelSplitter.css";

function ExcelSplitter() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [status, setStatus] = useState("");

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
    formData.append("header_color", "#a855f7"); // Defaults elegantly to our neon purple brand color

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
    <div className="workspace-view animate-fade">
      <button onClick={() => navigate("/")} className="back-btn">
        ← Back to Dashboard
      </button>

      <div className="workspace-panel">
        <div className="panel-header">
          <h2>Excel Splitter</h2>
          <p>
            Segment massive workbook registries into individual standalone files
            dynamically.
          </p>
        </div>

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

        <div className="form-group">
          <label className="field-label">Target Split Column</label>
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
              placeholder="Upload a spreadsheet to load active headers..."
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
