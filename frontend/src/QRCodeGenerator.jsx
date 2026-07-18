import "./ExcelSplitter.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function QRCodeGenerator() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      alert("Please enter a URL");
      return;
    }
    setStatus("Generating QR Code...");

    const formData = new FormData();
    formData.append("url", url);
    formData.append("filename", "my-qrcode.png");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/generate-qr`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to generate QR code on the backend!");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "my-qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl); // Cleans up memory browser cache
      setStatus("QR Code generated and downloaded successfully ✅");
    } catch (err) {
      console.error(err);
      setStatus("Error generating QR code ❌");
    }
  };

  return (
    <div className="workspace-view animate-fade">
      <button onClick={() => navigate("/")} className="back-btn">
        ← Back to Dashboard
      </button>
      <div className="workspace-panel">
        <div>
          <h1>QR Code Generator</h1>
          {/* 1. Added onSubmit event listener to the form */}
          <form onSubmit={handleSubmit}>
            <label className="field-label">
              URL:
              {/* 2. Added value and onChange to control the input element */}
              <input
                type="text"
                name="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="file-input"
                placeholder="Enter URL"
              />
            </label>
            <button className="action-btn" type="submit">
              Generate QR Code
            </button>
          </form>

          {/* 3. Added status message layout below the form */}
          {status && (
            <p className="status-message" style={{ marginTop: "1rem" }}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRCodeGenerator;
