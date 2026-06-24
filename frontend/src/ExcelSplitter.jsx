import { useState } from "react";
import "./ExcelSplitter.css";
function ExcelSplitter({ onBack }) {
  const [file, setFile] = useState(null);
  const [columnName, setColumnName] = useState("name");
  const [headerColor, setHeaderColor] = useState("#2e7d32");
  const [status, setStatus] = useState("");

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleUpload() {
    if (!file) {
      setStatus("Pick a file first ❌");
      return;
    }

    setStatus("Processing your Excel file...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("split_column", columnName);
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
        <label>Target Column Name:</label>
        <input
          type="text"
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          className="text-input"
        />
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

      <button onClick={handleUpload} className="submit-btn">
        Split it
      </button>

      <p className="status-text">{status}</p>
    </div>
  );
}

export default ExcelSplitter;
