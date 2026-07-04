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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_files"
os.makedirs(TEMP_DIR, exist_ok=True)


def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
            print(f"Cleaned up: {path}")
    except Exception as e:
        print(f"Cleanup failed for {path}: {str(e)}")


def apply_excel_theme(buffer, hex_color="A855F7"):
    buffer.seek(0)
    wb = openpyxl.load_workbook(buffer)
    ws = wb.active
    clean_hex = hex_color.replace("#", "")
    header_fill = PatternFill(start_color=clean_hex, end_color=clean_hex, fill_type="solid")
    white_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    center_align = Alignment(horizontal="center", vertical="center")
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = white_font
        cell.alignment = center_align
    output_buffer = BytesIO()
    wb.save(output_buffer)
    output_buffer.seek(0)
    return output_buffer


# ─── NEW: inspect endpoint — returns sheet names + columns for a given sheet ───
@app.post("/api/inspect")
async def inspect_excel(
    file: UploadFile = File(...),
    sheet: str = Form(None),
    header_row: int = Form(0)  # 0 = row 1, 1 = row 2
):
    contents = await file.read()
    try:
        xl = pd.ExcelFile(BytesIO(contents))
        sheets = xl.sheet_names
        target_sheet = sheet if sheet else sheets[0]
        df = xl.parse(target_sheet, header=header_row)
        columns = list(df.columns)
        return {"sheets": sheets, "columns": columns}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")


# ─── UPDATED: split now accepts sheet name ───
@app.post("/api/split")
async def split_excel(
    file: UploadFile = File(...),
    split_column: str = Form(...),

    sheet: str = Form(None),
    header_row: int = Form(0),
    header_color: str = Form("#a855f7")
):
    contents = await file.read()
    split_column = split_column.strip()

    try:
        xl = pd.ExcelFile(BytesIO(contents))
        target_sheet = sheet if sheet else xl.sheet_names[0]
        df = pd.read_excel(BytesIO(contents), sheet_name=target_sheet, header =header_row, engine='openpyxl')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")

    if split_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Column '{split_column}' not found. Available: {list(df.columns)}"
        )

    grouped = df.groupby(split_column)
    unique_keys = list(grouped.groups.keys())

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


# ─── kept for backwards compat but inspect replaces this ───
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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Please upload a valid .docx file.")

    input_docx_path = os.path.join(TEMP_DIR, file.filename)
    output_pdf_path = os.path.join(TEMP_DIR, file.filename.replace(".docx", ".pdf"))

    try:
        with open(input_docx_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        convert(input_docx_path, output_pdf_path)
        background_tasks.add_task(remove_file, output_pdf_path)
        return FileResponse(
            path=output_pdf_path,
            media_type="application/pdf",
            filename=os.path.basename(output_pdf_path)
        )
    except Exception as e:
        if os.path.exists(output_pdf_path):
            os.remove(output_pdf_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    finally:
        if os.path.exists(input_docx_path):
            os.remove(input_docx_path)