import { Link } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <div className="app-wrapper">
      <div className="dashboard-container">
        <h1 className="brand-title">
          <i>DocuFlow</i>
        </h1>
        <p className="brand-description">
          Welcome to DocuFlow! Your ultimate workspace to split spreadsheets,
          convert documents, and automate your heavy file processing workflows
          instantly.
        </p>

        <h2 className="section-title">Available Workspaces</h2>

        <div className="tools-grid">
          {/* Using modern <Link> to target our path instead of setting manual state strings */}
          <Link
            to="/splitter"
            className="card interactive-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="counter text-tag">Spreadsheets</div>
            <h3 className="card-heading">Excel Splitter</h3>
            <p className="card-text">
              Segment massive workbook registries into individual standalone
              files dynamically by unique column criteria.
            </p>
          </Link>

          <Link
            to={"/wordToPdf"}
            className="card interactive-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="counter text-tag">Coming Soon</div>
            <h3 className="card-heading">Convert PDF into Word</h3>
            <p className="card-text">
              Extract and format rich layout text structures directly from
              read-only PDF sheets into editable `.docx` files.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
