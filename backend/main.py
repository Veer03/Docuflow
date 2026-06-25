from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
import zipfile
# Import openpyxl styles to color the actual Excel cells
from openpyxl.styles import PatternFill, Font, Alignment

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def apply_excel_theme(buffer):
    buffer.seek(0)
    # Re-open the Excel file in memory using openpyxl
    import openpyxl
    wb = openpyxl.load_workbook(buffer)
    ws = wb.active

    # Create corporate green fill and white bold text
    green_fill = PatternFill(start_color="2E7D32", end_color="2E7D32", fill_type="solid")
    white_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    center_align = Alignment(horizontal="center", vertical="center")

    # Apply the styling specifically to the first row (the headers)
    for cell in ws[1]:
        cell.fill = green_fill
        cell.font = white_font
        cell.alignment = center_align

    # Save it right back into a new buffer
    output_buffer = BytesIO()
    wb.save(output_buffer)
    output_buffer.seek(0)
    return output_buffer

@app.post("/api/split")
async def split_excel(

    file: UploadFile = File(...), 
    split_column: str = Form(...)
):
    columnList = list(df.columns)
    contents = await file.read()
    split_column = split_column.strip()
    
    try:
        df = pd.read_excel(BytesIO(contents), engine='openpyxl')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")

    if split_column not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Column '{split_column}' not found. Available columns: {columnList}"
        )

    grouped = df.groupby(split_column)
    unique_keys = list(grouped.groups.keys())

    # Case A: One unique group
    if len(unique_keys) == 1:
        key = unique_keys[0]
        group_df = grouped.get_group(key)
        
        excel_buffer = BytesIO()
        group_df.to_excel(excel_buffer, index=False, engine='openpyxl')
        
        # Apply the true green Excel formatting
        final_buffer = apply_excel_theme(excel_buffer)
        
        return StreamingResponse(
            final_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={key}.xlsx"}
        )

    # Case B: Muultiple groups -> ZIP package
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for group_name, group_df in grouped:
            safe_name = str(group_name).replace("/", "_").replace("\\", "_")
            
            excel_buffer = BytesIO()
            group_df.to_excel(excel_buffer, index=False, engine='openpyxl')
            
            # Apply the true green Excel formatting to this sheet
            final_buffer = apply_excel_theme(excel_buffer)
            
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