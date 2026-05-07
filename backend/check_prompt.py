import os

# Проверю разные варианты путей
service_file = os.path.abspath(__file__)
print(f"Service file: {service_file}")

# Вариант 1: относительно файла сервиса
base1 = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print(f"Base1 (3 levels up): {base1}")
prompt1 = os.path.join(base1, "prompts", "document-generator", "claim.txt")
print(f"Prompt1: {prompt1}")
print(f"Exists1: {os.path.exists(prompt1)}")

# Вариант 2: относительно cwd
cwd = os.getcwd()
print(f"\nCWD: {cwd}")
prompt2 = os.path.join(cwd, "..", "prompts", "document-generator", "claim.txt")
print(f"Prompt2: {prompt2}")
print(f"Exists2: {os.path.exists(prompt2)}")

# Вариант 3: относительно app目录
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print(f"\nApp dir: {app_dir}")
prompt3 = os.path.join(app_dir, "..", "prompts", "document-generator", "claim.txt")
print(f"Prompt3: {prompt3}")
print(f"Exists3: {os.path.exists(prompt3)}")

# Список всех claim.txt на уровень выше
import glob
search = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "**", "claim.txt")
matches = glob.glob(search, recursive=True)
print(f"\nGlob matches: {matches}")

search2 = os.path.join(os.getcwd(), "..", "**", "claim.txt")
matches2 = glob.glob(search2, recursive=True)
print(f"Glob2 matches: {matches2}")
