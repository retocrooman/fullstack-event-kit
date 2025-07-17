# Scripts

This directory contains scripts to improve development efficiency.

## ai-commit-message.sh

A script that uses Ollama to run llama3:instruct locally and analyze git diff to automatically generate commit messages.

### Setup

1. Install Ollama (https://ollama.ai)
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. Download llama3:instruct model:
   ```bash
   ollama pull llama3:instruct
   ```
4. Install dependencies:

   ```bash
   # macOS
   brew install jq

   # Ubuntu/Debian
   sudo apt-get install jq
   ```

### Usage

```bash
# Generate commit message only
./scripts/ai-commit-message.sh

# Auto commit
./scripts/ai-commit-message.sh --commit

# Use different model
OLLAMA_MODEL=llama3.2:3b ./scripts/ai-commit-message.sh
```

### Features

- **Private**: Complete local execution with no external data transmission
- **Free**: No API fees required
- **Powerful**: Uses llama3:instruct for high-quality commit message generation
- **Customizable**: Various model options available
- **Offline Support**: No internet connection required (after model download)
- **Smart Fallback**: Automatic fallback logic when AI generation fails

### Commit Message Format

The script generates commit messages following this project's format:

```
<type>: <description>
```

Valid types: `fix`, `feat`, `config`, `refactor`, `remove`, `revert`, `doc`, `test`, `build`, `ci`, `chore`, `change`

---

## Other Scripts

- **docker.test.sh**: Docker testing utilities
- **push.sh**: Git push automation
- **release-tag.sh**: Release tagging utilities
- **remove-node-modules.sh**: Clean node_modules directories
- **reset-docker.sh**: Docker environment reset
