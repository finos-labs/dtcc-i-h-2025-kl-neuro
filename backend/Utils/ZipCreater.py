import io
import zipfile
import os

def create_zip_from_files(file_list):
    # In-memory bytes buffer
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in file_list:
            if os.path.exists(file_path):
                # Write file to zip with its basename (without full path)
                zip_file.write(file_path, os.path.basename(file_path))
            else:
                print(f"⚠️ File not found: {file_path}")

    zip_buffer.seek(0)
    
    return zip_buffer.getvalue()
