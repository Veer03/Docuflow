import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExcelSplitter.css"; // Reuses our premium, dark-tech dashboard panel styles

function WordToPdf() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  function handleFileChange(e) {
    const pickedFile = e.target.files[0];
    if (pickedFile) {
      setFile(pickedFile);
      setStatus("Word document loaded successfully! 📄");
    }
  }

  async function handleConvert() {
    if (!file) {
      setStatus("Please select a Word document first ❌");
      return;
    }

    setStatus(
      "Please wait, compiling Word layout configurations to PDF streams... ⚡",
    );

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/word-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setStatus("Conversion failed on the backend server ❌");
        return;
      }

      // Read response stream as raw binary data blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Virtual anchor link generation to trigger the native browser download
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".docx", ".pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus("Done! PDF generated and downloaded successfully ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error connecting to conversion backend service");
    }
  }

  return (
    <div className="workspace-view animate-fade">
      <button onClick={() => navigate("/")} className="back-btn">
        ← Back to Dashboard
      </button>

      <div className="workspace-panel">
        <div className="panel-header">
          <h2>Word to PDF Converter</h2>
          <p>
            Lock layout structures, graphics, and text alignments into secure
            PDF blocks.
          </p>
        </div>

        <div className="form-group">
          <label className="field-label">Upload Word Document</label>
          <div className="file-upload-zone">
            <input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="file-input-hidden"
              id="word-file"
            />
            <label htmlFor="word-file" className="file-upload-label">
              {file
                ? `📄 ${file.name}`
                : "Click to browse or drop your .docx file here"}
            </label>
          </div>
        </div>

        <button onClick={handleConvert} className="action-btn" disabled={!file}>
          Compile and Download PDF
        </button>

        {status && <p className="tech-status">{status}</p>}
      </div>
    </div>
  );
}

export default WordToPdf;
