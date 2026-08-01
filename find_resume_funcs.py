with open("backend/main.py", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if "def " in line and "resume" in line.lower():
            print(f"Line {i}: {line.strip()}")
 