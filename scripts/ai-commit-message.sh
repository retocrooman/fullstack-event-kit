#!/bin/bash
set -e

MODEL=${OLLAMA_MODEL:-"llama3:instruct"}

check_ollama() {
  command -v ollama >/dev/null || { echo "❌ Ollama not installed"; exit 1; }
  curl -s http://localhost:11434/api/tags > /dev/null || { echo "❌ Ollama not running"; exit 1; }
  ollama list | grep -q "$MODEL" || ollama pull "$MODEL"
}

generate_prompt() {
  files=$(git diff --cached --name-only | tr '\n' ' ')
  diffstat=$(git diff --cached --stat)
  git diff --cached --unified=3 > /tmp/git-diff.txt

  cat <<EOF
You are a developer. Create a short Git commit message.

Changed files:
$files

Diff summary:
$diffstat

Partial diff content:
/tmp/git-diff.txt

Rules:
- Format: <type>: <description>
- Types: fix, feat, chore, doc, refactor, test, etc.
- Use present tense, no period
- Output only the commit message
EOF
}

call_ollama() {
  prompt=$(generate_prompt | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
  payload="{\"model\":\"$MODEL\",\"prompt\":$prompt,\"stream\":false}"

  curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d "$payload" | python3 -c 'import sys, json; print(json.load(sys.stdin)["response"].splitlines()[0])'
}

interactive_commit() {
  echo "💬 Generated commit message:"
  echo "   $1"
  echo ""
  echo "Press Enter to commit, or any other key + Enter to cancel:"
  read -r response
  
  if [[ -z "$response" ]]; then
    git commit -m "$1"
    echo "✅ Committed successfully!"
  else
    echo "❌ Commit cancelled"
    exit 1
  fi
}

main() {
  # Check for --commit flag for backward compatibility
  [[ "$1" == "--commit" ]] && commit_flag=true
  
  # Check for --interactive or -i flag
  [[ "$1" == "--interactive" || "$1" == "-i" ]] && interactive_flag=true

  check_ollama
  git diff --cached --quiet && echo "❌ No staged changes" && exit 1

  msg=$(call_ollama)
  
  if [[ "$interactive_flag" = true ]]; then
    interactive_commit "$msg"
  elif [[ "$commit_flag" = true ]]; then
    echo "💬 $msg"
    git commit -m "$msg"
  else
    # Default behavior: interactive mode
    interactive_commit "$msg"
  fi
}

main "$@"
