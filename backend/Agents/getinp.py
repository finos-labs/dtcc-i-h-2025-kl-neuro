
import re
from typing import List
from Emit import *
def extract_constructor_parameters(code: str) -> List[str]:
    wtsend("> Extracting inputs")
    match = re.search(r'constructor\s*\((.*?)\)', code, re.DOTALL)
    if not match:
        return []
    
    return [p.strip().split()[-1].replace('_', '') for p in match.group(1).split(',') if p.strip()]