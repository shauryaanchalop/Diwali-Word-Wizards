import base64
import os

logo_path = r"C:\Users\shaur\.gemini\antigravity\scratch\word-wizards-diwali\assets\word-wizards-logo.png"
with open(logo_path, "rb") as f:
    b64_str = base64.b64encode(f.read()).decode("utf-8")

out_path = r"C:\Users\shaur\.gemini\antigravity\scratch\word-wizards-diwali\assets\logo_data.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.write('window.WORD_WIZARDS_LOGO_B64 = "data:image/png;base64,' + b64_str + '";\n')

print("Created logo_data.js, size:", os.path.getsize(out_path))

