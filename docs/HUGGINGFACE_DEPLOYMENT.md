# Hugging Face Deployment Guide

## Quick Start (5 Minutes)

1. **Login**: `huggingface-cli login`
2. **Create Repos**:
   - `estu-research/llama3-8b-sql-ft`
   - `estu-research/gemma-7b-sql-ft`
3. **Upload Docs**: Copy `models/LLAMA3_MODEL_CARD.md` to README.md
4. **Note**: Add "⚠️ Weights coming soon" to top of README

## Future: Full Deployment

1. **Fine-Tuning**: Run `python experiments/finetune_llama.py` (requires GPU)
2. **Upload**: 
   ```python
   model.push_to_hub("estu-research/llama3-8b-sql-ft")
   ```

See `docs/FINAL_STRUCTURE.md` for repo layout.
