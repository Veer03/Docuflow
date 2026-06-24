import { useState } from "react";
import ExcelSplitter from "./ExcelSplitter";
import "./index.css";

function App() {
  const [currentView, setCurrentView] = useState("welcome");

  return (
    <div className="app-wrapper">
      {currentView === "welcome" && (
        <div className="dashboard-container">
          <h1 className="brand-title">DocuFlow</h1>
          <p className="brand-description">
            Welcome to DocuFlow! Your ultimate workspace to split spreadsheets,
            convert documents, and automate your heavy file processing workflows
            instantly.
          </p>

          <h2 className="section-title">Available Workspaces</h2>

          <div className="tools-grid">
            <div
              onClick={() => setCurrentView("splitter")}
              className="card interactive-card"
            >
              <div className="counter text-tag">Spreadsheets</div>
              <h3 className="card-heading">Excel Splitter</h3>
              <p className="card-text">
                Segment massive workbook registries into individual standalone
                files dynamically by unique column criteria.
              </p>
            </div>

            <div className="card disabled-card">
              <div className="counter locked-tag">Coming Soon</div>
              <h3 className="card-heading">Convert PDF into Word</h3>
              <p className="card-text">
                Extract and format rich layout text structures directly from
                read-only PDF sheets into editable `.docx` files.
              </p>
            </div>

            <div className="card disabled-card">
              <div className="counter locked-tag">Coming Soon</div>
              <h3 className="card-heading">Convert Word into PDF</h3>
              <p className="card-text">
                Lock structural fonts, element placements, and file alignment
                configurations by compiling Word blocks safely to PDF.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentView === "splitter" && (
        <ExcelSplitter onBack={() => setCurrentView("welcome")} />
      )}
    </div>
  );
}

export default App;
