#!/usr/bin/env python3
"""
Claude Code Hook: Enforce CLAUDE.md Rules
This hook validates user prompts against project-specific guidelines.
"""
import json
import sys
import re
import os

def check_prompt_against_rules(prompt):
    """Check if the user prompt might violate CLAUDE.md rules."""
    violations = []
    
    # Check for code changes without test verification
    if re.search(r'(add|create|update|modify|change|refactor|fix).*(file|code|function|class|component)', prompt, re.IGNORECASE):
        if not re.search(r'(test|lint|build)', prompt, re.IGNORECASE):
            violations.append({
                "rule": "MANDATORY Test Verification",
                "message": "Code changes must include testing verification. Run: pnpm api test, pnpm api lint, pnpm api build"
            })
    
    # Check for environment variable usage
    if re.search(r'process\.env', prompt, re.IGNORECASE):
        violations.append({
            "rule": "EnvConfig Usage",
            "message": "ALWAYS use EnvConfig class instead of process.env directly"
        })
    
    # Check for file creation without explicit need
    if re.search(r'create.*new.*file', prompt, re.IGNORECASE):
        if not re.search(r'(necessary|required|needed)', prompt, re.IGNORECASE):
            violations.append({
                "rule": "File Creation Policy",
                "message": "NEVER create files unless absolutely necessary. ALWAYS prefer editing existing files."
            })
    
    # Check for documentation creation
    if re.search(r'create.*(README|\.md|documentation)', prompt, re.IGNORECASE):
        violations.append({
            "rule": "Documentation Policy", 
            "message": "NEVER proactively create documentation files. Only create if explicitly requested."
        })
    
    # Check for README update reminders
    if re.search(r'(add|create|update|modify|change|refactor|fix).*(feature|module|endpoint|api)', prompt, re.IGNORECASE):
        if not re.search(r'readme', prompt, re.IGNORECASE):
            violations.append({
                "rule": "README Update Reminder",
                "message": "Consider updating README.md when adding new features or changing architecture"
            })
    
    return violations

def main():
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        prompt = input_data.get("prompt", "")
        
        # Check for rule violations
        violations = check_prompt_against_rules(prompt)
        
        if violations:
            # Create warning message
            warning_messages = []
            for violation in violations:
                warning_messages.append(f"⚠️ {violation['rule']}: {violation['message']}")
            
            # Add context to remind about rules
            additional_context = f"""
🔒 CLAUDE.md Rule Enforcement Active:

{chr(10).join(warning_messages)}

📋 Remember these MANDATORY requirements:
1. Run tests: pnpm api test
2. Run linting: pnpm api lint  
3. Run build: pnpm api build
4. Use EnvConfig for environment variables
5. Edit existing files instead of creating new ones
6. Update README.md when adding features or changing architecture

Continue with your request, but ensure compliance with these rules.
"""
            
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit",
                    "additionalContext": additional_context
                }
            }
        else:
            # No violations - add general reminder
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit", 
                    "additionalContext": "📋 CLAUDE.md rules are active. Remember: test → lint → build for all code changes."
                }
            }
        
        print(json.dumps(output))
        sys.exit(0)
        
    except Exception as e:
        # Log error but don't block
        print(f"Hook error: {e}", file=sys.stderr)
        print(json.dumps({}))
        sys.exit(0)

if __name__ == "__main__":
    main()