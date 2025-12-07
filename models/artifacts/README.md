# Fine-Tuned Model Artifacts

This directory contains (or will contain) the fine-tuned model files.

## Model Files

### 1. Gemma-7B Fine-Tuned
**File**: `gemma_ft.torch` or `gemma_ft/`  
**Format**: PyTorch (.pt, .pth, .torch) or Safetensors  
**Size**: ~14 GB  
**Download**: 
```bash
# Option 1: From Hugging Face
huggingface-cli download estu-research/gemma-7b-sql-ft --local-dir ./gemma_ft

# Option 2: Load in code
from transformers import AutoModelForCausalLM
model = AutoModelForCausalLM.from_pretrained("estu-research/gemma-7b-sql-ft")
```

### 2. Llama-3-8B Fine-Tuned
**File**: `llama3_ft.torch` or `llama3_ft/`  
**Format**: PyTorch with LoRA adapters  
**Size**: ~16 GB (full model) or ~200 MB (LoRA only)  
**Download**:
```bash
# Option 1: From Hugging Face
huggingface-cli download estu-research/llama3-8b-sql-ft --local-dir ./llama3_ft

# Option 2: Load LoRA adapters
from peft import PeftModel
base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B")
model = PeftModel.from_pretrained(base_model, "estu-research/llama3-8b-sql-ft")
```

### 3. GPT-4o-mini Fine-Tuned
**File**: N/A (Cloud-based)  
**Access**: Via OpenAI API  
**Model ID**: Set in `.env` as `FT_GPT4O_MINI_MODEL`

## Why Model Files Are Not Included

1. **Size**: Fine-tuned models are 14-16 GB each
2. **GitHub Limits**: Cannot store large binary files
3. **Best Practice**: Models hosted on Hugging Face Hub
4. **Access Method**: Download via CLI or load directly in code

## How to Use

### Option 1: Cloud (Recommended)
Models are hosted on Hugging Face Hub and loaded automatically when needed.

### Option 2: Local Download
1. Install Hugging Face CLI:
```bash
pip install huggingface_hub
```

2. Login (if models are private):
```bash
huggingface-cli login
```

3. Download models:
```bash
# Gemma
huggingface-cli download estu-research/gemma-7b-sql-ft --local-dir ./models/artifacts/gemma_ft

# Llama-3
huggingface-cli download estu-research/llama3-8b-sql-ft --local-dir ./models/artifacts/llama3_ft
```

4. Update `.env` to point to local paths:
```env
FT_GEMMA_MODEL=./models/artifacts/gemma_ft
FT_LLAMA3_MODEL=./models/artifacts/llama3_ft
```

## Directory Structure

```
models/artifacts/
├── README.md (this file)
├── gemma_ft/          # Gemma fine-tuned (14 GB) - gitignored
│   ├── config.json
│   ├── model.safetensors
│   └── tokenizer files
├── llama3_ft/         # Llama-3 fine-tuned (16 GB) - gitignored
│   ├── adapter_config.json
│   ├── adapter_model.bin
│   └── base model files
└── .gitignore         # Ignores large model files
```

## Performance Metrics

| Model | Accuracy | Size | Speed | Cost |
|-------|----------|------|-------|------|
| Gemma-7B (FT) | 76.0% | 14 GB | 500ms | Free |
| Llama-3-8B (FT) | 78.2% | 16 GB | 450ms | Free |
| GPT-4o-mini (FT) | 97.8% | Cloud | 800ms | $0.30/1k |

## Notes

- Real model files are **NOT** included in this repository
- Use placeholder structure for local development
- Production deployment uses cloud-hosted models
- See `models/README.md` for full documentation
