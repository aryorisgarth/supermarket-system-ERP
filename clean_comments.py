import os
import re

# Regex seguro para Java, JS, JSX: descarta strings (comillas dobles, simples, backticks)
# y remueve comentarios multilinea /* ... */ y comentarios monolínea // ...
# Conserva las llaves contenedoras {} para no romper la sintaxis de bloques como catch o expresiones JSX vacías.
JS_JAVA_PATTERN = re.compile(
    r'(\"(?:\\.|[^"\\])*\"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`)|/\*.*?\*/|//[^\r\n]*',
    re.DOTALL
)

# Regex para CSS: descarta strings y remueve comentarios multilinea /* ... */
CSS_PATTERN = re.compile(
    r'(\"(?:\\.|[^"\\])*\"|\'(?:\\.|[^\'\\])*\')|/\*.*?\*/',
    re.DOTALL
)

def remove_comments(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    def replacer(match):
        # Si coincide con el Grupo 1 (que son strings/comillas), se mantiene intacto
        if match.group(1) is not None:
            return match.group(1)
        # De lo contrario, coincide con un comentario, por lo que se elimina
        return ""

    if ext == '.css':
        cleaned = re.sub(CSS_PATTERN, replacer, content)
    else:
        cleaned = re.sub(JS_JAVA_PATTERN, replacer, content)

    # Escribir de vuelta el archivo modificado
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)

def main():
    backend_dir = r"02-BACKEND"
    frontend_dir = r"03-FRONTEND/src"
    
    processed_count = 0
    
    # Procesar backend (Java)
    if os.path.exists(backend_dir):
        for root, dirs, files in os.walk(backend_dir):
            for file in files:
                if file.endswith('.java'):
                    path = os.path.join(root, file)
                    remove_comments(path)
                    processed_count += 1

    # Procesar frontend (JS, JSX, CSS)
    if os.path.exists(frontend_dir):
        for root, dirs, files in os.walk(frontend_dir):
            for file in files:
                if file.endswith(('.js', '.jsx', '.css')):
                    path = os.path.join(root, file)
                    remove_comments(path)
                    processed_count += 1

    print(f"Comentarios eliminados de forma segura en {processed_count} archivos de código.")

if __name__ == "__main__":
    main()
