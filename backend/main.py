import os
import shutil
import zipfile
import pandas as pd
import openpyxl
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from openpyxl.styles import PatternFill, Font, Alignment
from docx2pdf import convert

app = FastAPI()

# Enable CORS for your Vite frontend layout canvas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary system folder configuration for document processing files
TEMP_DIR = "temp_files"
os.makedirs(TEMP_DIR, exist_ok=True)


def remove_file(path: str):
    """Safely scrubs a file from disk after a background process finishes."""
    try:
        if os.path.exists(path):
            os.remove(path)
            print(f"🧹 Automated Cleanup: Cleaned up temporary file at {path}")
    except Exception as e:
        print(f"⚠️ Cleanup failed for {path}: {str(e)}")


def apply_excel_theme(buffer, hex_color="A855F7"):
    """Applies clean typography and custom header branding to split files."""
    buffer.seek(0)
    wb = openpyxl.load_workbook(buffer)
    ws = wb.active

    # Clean up standard incoming hex color prefixes
    clean_hex = hex_color.replace("#", "")

    # Premium tech corporate fills and clean text font options
    header_fill = PatternFill(start_color=clean_hex, end_color=clean_hex, fill_type="solid")
    white_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    center_align = Alignment(horizontal="center", vertical="center")

    # Apply look properties across the entire top index cells row
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = white_font
        cell.alignment = center_align

    output_buffer = BytesIO()
    wb.save(output_buffer)
    output_buffer.seek(0)
    return output_buffer


@app.post("/api/split")
async def split_excel(
    file: UploadFile = File(...), 
    split_column: str = Form(...),
    header_color: str = Form("#a855f7")
):
    contents = await file.read()
    split_column = split_column.strip()
    
    try:
        df = pd.read_excel(BytesIO(contents), engine='openpyxl')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")

    columnList = list(df.columns)

    if split_column not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Column '{split_column}' not found. Available columns: {columnList}"
        )

    grouped = df.groupby(split_column)
    unique_keys = list(grouped.groups.keys())

    # Case A: One unique group match
    if len(unique_keys) == 1:
        key = unique_keys[0]
        group_df = grouped.get_group(key)
        
        excel_buffer = BytesIO()
        group_df.to_excel(excel_buffer, index=False, engine='openpyxl')
        
        final_buffer = apply_excel_theme(excel_buffer, header_color)
        
        return StreamingResponse(
            final_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={key}.xlsx"}
        )

    # Case B: Multiple group targets compiled to a compressed zip package
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for group_name, group_df in grouped:
            safe_name = str(group_name).replace("/", "_").replace("\\", "_")
            
            excel_buffer = BytesIO()
            group_df.to_excel(excel_buffer, index=False, engine='openpyxl')
            
            final_buffer = apply_excel_theme(excel_buffer, header_color)
            
            zip_file.writestr(f"{safe_name}.xlsx", final_buffer.getvalue())

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=split_files.zip"}
    )


@app.post("/api/columns")
async def get_excel_columns(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = pd.read_excel(BytesIO(contents), engine='openpyxl', nrows=0)
        return {"columns": list(df.columns)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")


@app.post("/api/word-to-pdf")
async def word_to_pdf(
    background_tasks: BackgroundTasks, # 1. Inject the BackgroundTasks manager
    file: UploadFile = File(...)
):
    """Compiles uploaded .docx binary files safely into standard PDF blocks."""
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Invalid layout selection. Please pass a valid .docx structure.")
    
    input_docx_path = os.path.join(TEMP_DIR, file.filename)
    output_pdf_path = os.path.join(TEMP_DIR, file.filename.replace(".docx", ".pdf"))
    
    try:
        # Write binary input data straight onto temporary system disk storage cached lines
        with open(input_docx_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Execute cross-platform layout compilation compiler blocks
        convert(input_docx_path, output_pdf_path)
        
        # 2. Tell FastAPI to trigger the cleanup script *after* the response completes streaming
        background_tasks.add_task(remove_file, output_pdf_path)
        
        return FileResponse(
            path=output_pdf_path, 
            media_type="application/pdf", 
            filename=os.path.basename(output_pdf_path)
        )
        
    except Exception as e:
        print(f"Compilation conversion fault error logged: {str(e)}")
        # If the conversion crashed before finalizing, wipe out the compiled path if it was partially built
        if os.path.exists(output_pdf_path):
            os.remove(output_pdf_path)
        raise HTTPException(status_code=500, detail="Document generation system failed to output structural blocks.")
        
    finally:
        # Clear out source document inputs securely upon routine termination
        if os.path.exists(input_docx_path):
            os.remove(input_docx_path)