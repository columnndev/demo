import os
import json
import re
from pypdf import PdfReader

def clean_text(text):
    # Strip page headers / classification text globally
    text = re.sub(r'Informationsklass:\s*Konfidentiell\s*Låg\s*', '', text, flags=re.IGNORECASE)
    
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Clean leading and trailing whitespace on each line
    lines = [line.strip() for line in text.split('\n')]
    
    # Filter out excessive blank lines but keep single blank lines for paragraph structure
    cleaned_lines = []
    prev_empty = False
    for line in lines:
        if line == "":
            if not prev_empty:
                cleaned_lines.append(line)
                prev_empty = True
        else:
            cleaned_lines.append(line)
            prev_empty = False
            
    text = '\n'.join(cleaned_lines)
    
    # Replace multiple spaces/tabs with a single space
    text = re.sub(r'[ \t]+', ' ', text)
    
    return text.strip()

def extract_solution(text):
    text = re.sub(r'När ska denna rutin användas\?.*?(?=Vilka typer|Gör så här|Rutin för|Utförande)', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    headers = [
        r'Gör så här[:\s]*',
        r'Rutin för respektive ärende[:\s]*',
        r'Utförande[:\s]*',
        r'Åtgärd[:\s]*',
        r'Lösning[:\s]*'
    ]
    
    for header in headers:
        match = re.search(header, text, flags=re.IGNORECASE)
        if match:
            return text[match.end():].strip()
            
    skip_match = re.search(r'Vilka typer av ärenden finns det\?', text, flags=re.IGNORECASE)
    if skip_match:
        return text[skip_match.end():].strip()
        
    return text.strip()

def extract_routines(directory, output_file):
    routines = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.pdf'):
                path = os.path.join(root, file)
                title = file[:-4]
                
                content = ""
                try:
                    reader = PdfReader(path)
                    for i in range(len(reader.pages)):
                        page = reader.pages[i]
                        text = page.extract_text()
                        if text:
                            content += text + "\n"
                    
                    content = clean_text(content)
                    solution = extract_solution(content)
                    content = solution
                        
                except Exception as e:
                    content = "Kunde inte läsa innehållet från denna PDF."
                    print(f"Error reading {file}: {e}")
                
                routines.append({
                    "title": title,
                    # Använd relativ sökväg istället för absolut file:///
                    "path": os.path.relpath(path, start=r"C:\Users\Gusta\Desktop\demosystem för releasy").replace('\\', '/'),
                    "content": content
                })
                
    # Write to routines.js
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("const routinesDatabase = ")
        json.dump(routines, f, ensure_ascii=False)
        f.write(";\n")
        
    print(f"Extracted {len(routines)} routines to {output_file}")

if __name__ == "__main__":
    directory = r"C:\Users\Gusta\Desktop\demosystem för releasy\rutiner"
    output_file = "routines.js"
    extract_routines(directory, output_file)
