# 🌌 DocuFlow

DocuFlow is a sleek, developer-centric document automation workspace. It connects a premium dark-themed React single-page app frontend with a high-performance FastAPI Python backend to process heavy file operations instantly.

---

## Tech Stack & Architecture

### Frontend

- **React 19** & **Vite** – Fast, module-driven component architecture with instant hot-reloading (HMR).
- **React Router Dom** – Handles smooth client-side page transitions via `useNavigate()`.
- **Custom CSS** – Built on utility variables to drive a premium dark-tech layout panel.

### Backend

- **FastAPI** – Asynchronous Python framework delivering lightning-fast REST endpoints.
- **Pandas & OpenPyXL** – Slices data matrices and injects custom brand colors into header cells.
- **Docx2Pdf** – Compiles editable text templates into secure, text-selectable vector PDFs.

---

## System Data Flow

1. **Transport:** Frontend packages file attachments into a `multipart/form-data` payload and shoots a `POST` request to FastAPI.
2. **In-Memory Slicing:** Excel groups are processed in ultra-fast RAM buffers using `BytesIO` to save physical storage disk cycles.
3. **Background Cleanup:** When writing PDFs to disk (`temp_files`), FastAPI routes rely on `BackgroundTasks` to completely wipe files from the server cache the exact millisecond the browser download stream completes.

---

## Core Features

### 1. Excel Splitter

- Upload a master sheet (`.xlsx`) and choose a column header.
- Automates thousands of row separations into clean standalone sheets.
- Downloads a standalone `.xlsx` file for single matches, or a compiled `.zip` folder for multiple categories.

### 2. Word to PDF Converter

- Compiles editable `.docx` templates into professional `.pdf` documents.
- Outputs searchable vector blocks that preserve precise alignments and text selection (`Ctrl + F`).

---

## Setup & Installation

### 1. Backend Server

```bash
pip install fastapi uvicorn pandas openpyxl docx2pdf
uvicorn main:app --reload
```
