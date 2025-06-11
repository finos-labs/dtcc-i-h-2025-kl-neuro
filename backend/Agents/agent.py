from Solwriter import WriteSol
from getinp import extract_constructor_parameters
from Writedeploy import generate_deploy_script
from WriteHardHatConfig import generate_hardhat_config
from TestWriter import generate_tests
import subprocess
import re
name = input("name >")
prompt = input("prompt >")
WriteSol(name,prompt)
working_code = ''
with open(f"X:\DTCC_HACK\work\hard\contracts\{name}.sol","r") as file:
    working_code = file.read()
inp = extract_constructor_parameters(working_code)
inputvalues = {}
for i in inp:
    inputvalues[i] = input(f"{i} value -> ")

constructvalues = list(inputvalues.values())
name_match = re.search(r'contract\s+(\w+)', working_code)
contract_name = name_match.group(1) if name_match else "Generated"
generate_deploy_script(name=contract_name,args=constructvalues)
generate_hardhat_config()
generate_tests(working_code,name)
# subprocess.run(["node", "scripts/deploy.js"], cwd="X:\DTCC_HACK\work\hard")
