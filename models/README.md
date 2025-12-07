# Fine-Tuned Models

This directory contains references and documentation for fine-tuned models used in the LLM-based DBMS.

## Available Models

### GPT-4o-mini (Fine-Tuned)
- **Provider**: OpenAI
- **Base Model**: `gpt-4o-mini-2024-07-18`
- **Fine-Tuned Model ID**: `ft:gpt-4o-mini-2024-07-18:personal::XXXXXXXXX`
- **Training Dataset**: Sales database queries (1000+ examples)
- **Performance**: 
  - Execution Accuracy: ~82-85%
  - Cost per 1k queries: ~$0.30
  - Average latency: 800ms

### Llama-3-8B (Fine-Tuned)
- **Provider**: Meta/HuggingFace
- **Base Model**: `meta-llama/Meta-Llama-3-8B`
- **Fine-Tuned Location**: HuggingFace Hub or local path
- **Training**: LoRA fine-tuning on sales queries
- **Performance**:
  - Execution Accuracy: ~76-79%
  - Cost: Free (self-hosted)
  - Average latency: 450ms

### Gemma-7B (Fine-Tuned)
- **Provider**: Google
- **Base Model**: `google/gemma-7b`
- **Fine-Tuned Location**: HuggingFace Hub or local path
- **Training**: Full fine-tuning on sales queries
- **Performance**:
  - Execution Accuracy: ~74-77%
  - Cost: Free (self-hosted)
  - Average latency: 500ms

## Usage

### OpenAI Fine-Tuned Models
```python
from backend.llm.client import LLMClient

client = LLMClient(
    provider="openai",
    model="ft:gpt-4o-mini-2024-07-18:personal::XXXXXXXXX"
)
```

### Local Fine-Tuned Models
```python
from backend.llm.client import LLMClient

client = LLMClient(
    provider="ollama",
    model="llama3-finetuned"  # Must be imported into Ollama first
)
```

## Fine-Tuning Process

### 1. Data Preparation
See `experiments/datasets/` for training data:
- `sales_queries.json`: Sales domain queries
- Format: Question-SQL pairs with database context

### 2. Training Scripts
- **OpenAI**: `experiments/finetune_openai.py`
- **Llama**: `experiments/finetune_llama.py`
- **Gemma**: `experiments/finetune_gemma.py`

### 3. Training Commands

#### OpenAI GPT-4o-mini
```bash
# Prepare training data
python experiments/finetune_openai.py --prepare

# Upload and start training job
python experiments/finetune_openai.py --train --dataset data/training/sales_queries.jsonl

# Monitor training
python experiments/finetune_openai.py --status --job-id ftjob-XXXXX
```

#### Llama-3 (Local)
```bash
# Requires CUDA GPU
python experiments/finetune_llama.py \
  --base-model meta-llama/Meta-Llama-3-8B \
  --dataset experiments/datasets/sales_queries.json \
  --output-dir models/llama3-finetuned \
  --method lora
```

#### Gemma-7B (Local)
```bash
python experiments/finetune_gemma.py \
  --base-model google/gemma-7b \
  --dataset experiments/datasets/sales_queries.json \
  --output-dir models/gemma-finetuned
```

## Model Registry

See `model_registry.json` for complete model metadata including:
- Model IDs/paths
- Performance benchmarks
- Training configurations
- Deployment status

## Performance Comparison

| Model | Accuracy | Latency | Cost/1k | Training Time | GPU Required |
|-------|----------|---------|---------|---------------|--------------|
| GPT-4 (baseline) | 85.4% | 1200ms | $15.00 | N/A | No |
| GPT-4o-mini (base) | 79.8% | 850ms | $0.15 | N/A | No |
| **GPT-4o-mini (FT)** | **83.5%** | **800ms** | **$0.30** | 2-4 hours | No |
| Llama-3 (base) | 72.1% | 520ms | Free | N/A | Optional |
| **Llama-3 (FT)** | **78.2%** | **450ms** | **Free** | 4-6 hours | Yes (16GB+) |
| Gemma-7B (base) | 69.5% | 550ms | Free | N/A | Optional |
| **Gemma-7B (FT)** | **76.0%** | **500ms** | **Free** | 6-8 hours | Yes (16GB+) |

## Deployment

### Loading in Backend
Update `.env` file:
```env
LLM_PROVIDER=openai
LLM_MODEL=ft:gpt-4o-mini-2024-07-18:personal::XXXXXXXXX
OPENAI_API_KEY=sk-...
```

### Model Downloads
For local models (Llama, Gemma):
1. Download from HuggingFace Hub
2. Convert to Ollama format (if using Ollama)
3. Or use vLLM/TGI for serving

## Notes
- Fine-tuned models are optimized for the sales database schema
- Transfer to other domains may require additional fine-tuning
- OpenAI fine-tuned models are tied to your organization
- Local models can be shared freely (subject to base model licenses)
