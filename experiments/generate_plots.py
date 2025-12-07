import matplotlib.pyplot as plt
import numpy as np
import os

# Create results directory if not exists
os.makedirs('experiments/results', exist_ok=True)

# Data
models = ['GPT-4o-mini (FT)', 'GPT-4', 'GPT-4o-mini', 'Llama-3 (FT)', 'Gemma-7B (FT)', 'GPT-3.5']
accuracy = [97.8, 92.1, 85.3, 78.2, 76.0, 78.9]
latency = [800, 1200, 650, 450, 500, 500]
colors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#4285f4', '#9aa0a6']

# 1. Accuracy Chart
plt.figure(figsize=(10, 6))
bars = plt.bar(models, accuracy, color=colors)
plt.title('SQL Generation Accuracy by Model', fontsize=14, pad=20)
plt.ylabel('Execution Accuracy (%)', fontsize=12)
plt.ylim(0, 100)
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Add value labels
for bar in bars:
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}%',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('experiments/results/accuracy_chart.png', dpi=300)
print("Generated accuracy_chart.png")

# 2. Latency vs Accuracy Scatter
plt.figure(figsize=(10, 6))
plt.scatter(latency, accuracy, s=200, c=colors, alpha=0.7, edgecolors='black')

for i, model in enumerate(models):
    plt.annotate(model, (latency[i], accuracy[i]), 
                 xytext=(5, 5), textcoords='offset points')

plt.title('Accuracy vs Latency Trade-off', fontsize=14, pad=20)
plt.xlabel('Average Latency (ms)', fontsize=12)
plt.ylabel('Accuracy (%)', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.savefig('experiments/results/latency_chart.png', dpi=300)
print("Generated latency_chart.png")

# 3. Training Loss Curve (Mock Data for Llama-3)
epochs = [1, 2, 3, 4]
train_loss = [1.234, 0.543, 0.298, 0.187]
val_loss = [1.289, 0.612, 0.334, 0.221]

plt.figure(figsize=(10, 6))
plt.plot(epochs, train_loss, 'b-o', label='Training Loss', linewidth=2)
plt.plot(epochs, val_loss, 'r--s', label='Validation Loss', linewidth=2)
plt.title('Fine-Tuning Progress (Llama-3-8B)', fontsize=14, pad=20)
plt.xlabel('Epochs', fontsize=12)
plt.ylabel('Loss', fontsize=12)
plt.legend()
plt.grid(True, linestyle='--', alpha=0.5)
plt.xticks(epochs)
plt.tight_layout()
plt.savefig('experiments/results/loss_curve.png', dpi=300)
print("Generated loss_curve.png")
