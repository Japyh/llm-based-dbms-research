# Model Performance Comparison Report

**Project**: LLM-Based Database Management System
**Institution**: Eskisehir Technical University
**Date**: December 2024

## 1. Executive Summary

This report evaluates the performance of 6 Large Language Models on Text-to-SQL tasks using the Sales Database schema.

**Key Results**:
- **GPT-4o-mini (Fine-Tuned)** achieved highest accuracy (**97.8%**)
- **Fine-tuning** improved open-source model performance by **~12%**
- **Llama-3-8B** is the best self-hosted option (**78.2%**)

---

## 2. Visualizations

### Accuracy Comparison
![Accuracy Chart](../../docs/images/accuracy_chart.png)

### Latency vs Accuracy Trade-off
![Latency Chart](../../docs/images/latency_chart.png)

### Training Progress
![Loss Curve](../../docs/images/loss_curve.png)

---

## 3. Detailed Metrics Table

| Model | Type | Accuracy | Exact Match | Avg Latency | Cost/1K |
|-------|------|----------|-------------|-------------|---------|
| **GPT-4o-mini (FT)** | Fine-Tuned | **97.8%** | 91.2% | 800ms | $0.30 |
| GPT-4 | Base | 92.1% | 83.8% | 1200ms | $3.00 |
| GPT-4o-mini | Base | 85.3% | 74.5% | 650ms | $0.15 |
| GPT-3.5 Turbo | Base | 78.9% | 67.3% | 500ms | $0.05 |
| **Llama-3-8B (FT)** | Fine-Tuned | 78.2% | 68.9% | **450ms** | **Free** |
| Gemma-7B (FT) | Fine-Tuned | 76.0% | 65.4% | 500ms | **Free** |

---

## 4. Query Complexity Analysis

Performance breakdown by query difficulty levels:

**Simple Queries** (SELECT, WHERE, ORDER BY)
- GPT-4o-mini (FT): 99.2%
- Llama-3 (FT): 85.7%
- Gemma (FT): 82.1%

**Medium Queries** (JOIN, GROUP BY, aggregations)
- GPT-4o-mini (FT): 97.5%
- Llama-3 (FT): 76.8%
- Gemma (FT): 74.2%

**Complex Queries** (Subqueries, HAVING, Multiple JOINs)
- GPT-4o-mini (FT): 96.1%
- Llama-3 (FT): 72.3%
- Gemma (FT): 71.5%

---

## 5. Training Details

### Llama-3-8B Fine-Tuning
- **Hardware**: A100 GPU (80GB)
- **Time**: 12.4 hours
- **Method**: LoRA (Rank 16)
- **Dataset**: 1,000 Sales Queries

### GPT-4o-mini Fine-Tuning
- **Platform**: OpenAI Fine-Tuning API
- **Time**: 28 minutes
- **Cost**: ~$2.40
- **Epochs**: 3

---

## 6. Error Analysis

Common failure modes observed during testing:

1.  **Schema Hallucination** (Base Models)
    *   *Incorrect*: `SELECT name FROM clients...`
    *   *Correct*: `SELECT customerName FROM customers...`
    *   *Fix*: Fine-tuning reduced this error by 94%.

2.  **Join Type Errors** (Open Source Models)
    *   Tendency to use `INNER JOIN` when `LEFT JOIN` was required for reporting (e.g., "Show all customers and their orders").

3.  **Date Formatting**
    *   SQLite date handling differences (`strftime`) vs MySQL syntax. Fine-tuned models adapted to SQLite format correctly.
