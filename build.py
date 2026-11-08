import os

base_dir = r"C:\Users\shaur\.gemini\antigravity\scratch\word-wizards-diwali"
with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    html = f.read()

with open(os.path.join(base_dir, "style.css"), "r", encoding="utf-8") as f:
    css = f.read()

with open(os.path.join(base_dir, "script.js"), "r", encoding="utf-8") as f:
    js = f.read()

with open(os.path.join(base_dir, "assets", "logo_data.js"), "r", encoding="utf-8") as f:
    logo_js = f.read()

# Replace css link with embedded style
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')

# Replace logo script tag with embedded logo script
html = html.replace('<script src="assets/logo_data.js"></script>', '<script>\n' + logo_js + '\n</script>')

# Replace script tag with embedded script
html = html.replace('<script src="script.js"></script>', '<script>\n' + js + '\n</script>')

# In society-logo-badge in html, replace assets/word-wizards-logo.png with the base64 URI so image shows offline in standalone
with open(os.path.join(base_dir, "make_b64.py"), "r") as _:
    pass # we know window.WORD_WIZARDS_LOGO_B64 is in logo_js

import re
b64_match = re.search(r'window\.WORD_WIZARDS_LOGO_B64\s*=\s*"(data:image/png;base64,[^"]+)";', logo_js)
if b64_match:
    b64_uri = b64_match.group(1)
    html = html.replace('src="assets/word-wizards-logo.png"', f'src="{b64_uri}"')

target = os.path.join(base_dir, "standalone_preview.html")
with open(target, "w", encoding="utf-8") as f:
    f.write(html)

artifact_target = r"C:\Users\shaur\.gemini\antigravity\brain\95e8c57b-476b-4e66-b6e0-8ea5e5117f27\word_wizards_diwali.html"
with open(artifact_target, "w", encoding="utf-8") as f:
    f.write(html)

print("Built successfully. Standalone size:", os.path.getsize(target), "Artifact size:", os.path.getsize(artifact_target))
