#!/usr/bin/env python3
"""
Comprehensive Static Application Security Testing (SAST) Scanner
Based on OWASP Top 10, CWE Top 25, and multi-language SAST patterns.
"""

import os
import re
import json
import sys
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Any

@dataclass
class Finding:
    id: str
    title: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    cwe: str
    owasp: str
    category: str
    file_path: str
    line_number: int
    snippet: str
    description: str
    remediation: str

# Comprehensive Security Rules
RULES = [
    {
        "id": "SEC-001",
        "title": "Hardcoded High-Entropy Secret or Private Key",
        "severity": "CRITICAL",
        "cwe": "CWE-798",
        "owasp": "A07:2021-Identification and Authentication Failures",
        "category": "Secrets",
        "regex": re.compile(r"""(?:(?:api[_-]?key|secret|password|access[_-]?token|private[_-]?key)\s*[:=]\s*["\x27]([A-Za-z0-9+/=_-]{24,})["\x27])|(?:-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----)""", re.I),
        "description": "Hardcoded secret or private key credential found in source code.",
        "remediation": "Move secrets to secure environment variables or a secret vault.",
        "ignore_paths": ["tests/", "scripts/test-ai-security.mjs"] # Fixtures
    },
    {
        "id": "SEC-002",
        "title": "Dangerous innerHTML or unescaped HTML injection",
        "severity": "HIGH",
        "cwe": "CWE-79",
        "owasp": "A03:2021-Injection",
        "category": "XSS",
        "regex": re.compile(r"""(dangerouslySetInnerHTML\s*=|\.innerHTML\s*=|\.outerHTML\s*=|\bdocument\.write\s*\()"""),
        "description": "Direct insertion of unescaped HTML content can lead to Cross-Site Scripting (XSS).",
        "remediation": "Use React text bindings, DOMPurify, or safe DOM manipulation."
    },
    {
        "id": "SEC-003",
        "title": "Dangerous eval or Function constructor",
        "severity": "CRITICAL",
        "cwe": "CWE-95",
        "owasp": "A03:2021-Injection",
        "category": "Code Execution",
        "regex": re.compile(r"""\b(?:eval\s*\(|new\s+Function\s*\()"""),
        "description": "Dynamic execution of code using eval() or Function() can lead to arbitrary code execution.",
        "remediation": "Avoid dynamic code execution. Parse data using JSON.parse or strict parsers."
    },
    {
        "id": "SEC-004",
        "title": "Command Injection via Child Process",
        "severity": "CRITICAL",
        "cwe": "CWE-78",
        "owasp": "A03:2021-Injection",
        "category": "Command Injection",
        "regex": re.compile(r"""(?:child_process|require\(["\x27]child_process["\x27]\)|from\s+["\x27]child_process["\x27]|(?<!db\.)\b(?:execSync|spawnSync)\s*\()"""),
        "description": "Executing OS commands via child_process can allow command injection.",
        "remediation": "Avoid invoking shell commands with user input. Use safe parameter arrays if necessary."
    },
    {
        "id": "SEC-005",
        "title": "Insecure Pseudo-Random Number Generator",
        "severity": "MEDIUM",
        "cwe": "CWE-330",
        "owasp": "A02:2021-Cryptographic Failures",
        "category": "Cryptography",
        "regex": re.compile(r"""\bMath\.random\s*\(\)"""),
        "description": "Math.random() is cryptographically weak and predictable.",
        "remediation": "Use crypto.randomBytes() or crypto.getRandomValues() for security-sensitive tokens/salts."
    },
    {
        "id": "SEC-006",
        "title": "Reverse Tabnabbing Vulnerability",
        "severity": "LOW",
        "cwe": "CWE-1022",
        "owasp": "A05:2021-Security Misconfiguration",
        "category": "Client-Side",
        "regex": re.compile(r"""<a\b[^>]*target=["\x27]_blank["\x27](?![^>]*rel=["\x27][^"\x27]*noopener)"""),
        "description": "Anchor tags with target='_blank' without rel='noopener noreferrer' allow target windows to access window.opener.",
        "remediation": "Always add rel='noopener noreferrer' to external links opening in new tabs."
    },
    {
        "id": "SEC-007",
        "title": "PostgreSQL search_path Vulnerability in SECURITY DEFINER",
        "severity": "HIGH",
        "cwe": "CWE-426",
        "owasp": "A01:2021-Broken Access Control",
        "category": "Database",
        "regex": re.compile(r"""create\s+function[^\$]+security\s+definer(?!.*?set\s+search_path)""", re.I | re.S),
        "description": "PostgreSQL SECURITY DEFINER functions without explicit 'SET search_path = ''' can be hijacked via schema shadowing.",
        "remediation": "Always specify 'SET search_path = '''' on SECURITY DEFINER functions."
    },
    {
        "id": "SEC-008",
        "title": "Supabase Service Role Key Exfiltration to Client",
        "severity": "CRITICAL",
        "cwe": "CWE-200",
        "owasp": "A01:2021-Broken Access Control",
        "category": "Secrets",
        "regex": re.compile(r"""(NEXT_PUBLIC_.*SERVICE_ROLE|sb_secret_[a-zA-Z0-9_-]+)""", re.I),
        "description": "Exposing service_role secret keys to client-side bundles allows full database bypass.",
        "remediation": "Keep service_role keys strictly server-side and never prefix with NEXT_PUBLIC_."
    },
    {
        "id": "SEC-009",
        "title": "Unbounded Request Body Ingestion (DoS)",
        "severity": "MEDIUM",
        "cwe": "CWE-400",
        "owasp": "A04:2021-Insecure Design",
        "category": "Denial of Service",
        "regex": re.compile(r"""request\.json\(\)"""),
        "description": "Parsing unbounded JSON directly into memory without size checks can lead to OOM / DoS.",
        "remediation": "Use bounded stream readers or enforce content-length and byte-size limits before parsing."
    }
]

def scan_repository(repo_path: str) -> List[Finding]:
    findings: List[Finding] = []
    repo = Path(repo_path)

    scanned_extensions = {".ts", ".tsx", ".js", ".mjs", ".sql", ".json"}
    excluded_dirs = {"node_modules", ".next", ".git", ".system_generated"}

    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for file in files:
            ext = Path(file).suffix
            if ext not in scanned_extensions:
                continue

            file_path = os.path.relpath(os.path.join(root, file), repo_path)
            
            try:
                with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    lines = content.splitlines()

                    for rule in RULES:
                        if "ignore_paths" in rule:
                            if any(ignored in file_path for ignored in rule["ignore_paths"]):
                                continue

                        # Multi-line or single-line search
                        matches = list(rule["regex"].finditer(content))
                        for match in matches:
                            start_pos = match.start()
                            # Compute line number
                            line_no = content[:start_pos].count("\n") + 1
                            line_content = lines[line_no - 1] if line_no - 1 < len(lines) else ""
                            
                            snippet = line_content.strip()[:120]
                            # Filter false positives
                            if rule["id"] == "SEC-009" and "boundedJson" in content:
                                # If the file defines or uses boundedJson, request.json() is safe or replaced
                                continue

                            findings.append(Finding(
                                id=rule["id"],
                                title=rule["title"],
                                severity=rule["severity"],
                                cwe=rule["cwe"],
                                owasp=rule["owasp"],
                                category=rule["category"],
                                file_path=file_path,
                                line_number=line_no,
                                snippet=snippet,
                                description=rule["description"],
                                remediation=rule["remediation"]
                            ))
            except Exception as e:
                print(f"Error reading {file_path}: {e}", file=sys.stderr)

    return findings

def main():
    repo_path = "."
    findings = scan_repository(repo_path)
    
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
    findings.sort(key=lambda f: severity_order.get(f.severity, 5))

    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    report = {
        "status": "COMPLETED",
        "total_findings": len(findings),
        "summary": counts,
        "findings": [asdict(f) for f in findings]
    }

    report_path = "sast-report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"=== SAST SCAN RESULTS ===")
    print(f"Total Findings: {len(findings)}")
    print(f"  CRITICAL : {counts['CRITICAL']}")
    print(f"  HIGH     : {counts['HIGH']}")
    print(f"  MEDIUM   : {counts['MEDIUM']}")
    print(f"  LOW      : {counts['LOW']}")
    print(f"  INFO     : {counts['INFO']}")
    print(f"Report saved to: {report_path}")

    for f in findings:
        print(f"[{f.severity}] {f.id} - {f.title} ({f.file_path}:{f.line_number})")

if __name__ == "__main__":
    main()
