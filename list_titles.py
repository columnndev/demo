import re
try:
    with open('routines.js', encoding='utf-8') as f:
        data = f.read()
    titles = re.findall(r'title:\s*"([^"]+)"', data)
    print("Found titles:", len(titles))
    for t in titles[:30]:
        print("-", t)
except Exception as e:
    print("Error:", e)
