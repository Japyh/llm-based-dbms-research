"""
OpenAI GPT-4o-mini Fine-Tuning Script
Creates and monitors a fine-tuning job for SQL generation

This script uses OpenAI's Fine-Tuning API to create a custom model
that specializes in converting natural language to SQL queries.
"""

import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def upload_training_file(file_path):
    """Upload training data to OpenAI"""
    print(f"📁 Uploading training file: {file_path}")
    
    with open(file_path, 'rb') as f:
        response = client.files.create(
            file=f,
            purpose='fine-tune'
        )
    
    print(f"✅ File uploaded successfully!")
    print(f"   File ID: {response.id}")
    print(f"   Filename: {response.filename}")
    print(f"   Size: {response.bytes} bytes")
    
    return response.id

def create_fine_tune_job(training_file_id, model="gpt-4o-mini-2024-07-18"):
    """Create a fine-tuning job"""
    print(f"\n🚀 Creating fine-tuning job...")
    print(f"   Base model: {model}")
    
    response = client.fine_tuning.jobs.create(
        training_file=training_file_id,
        model=model,
        hyperparameters={
            "n_epochs": 3,  # Number of training epochs
            "batch_size": 4,  # Batch size
            "learning_rate_multiplier": 1.8  # Learning rate multiplier
        },
        suffix="sql-expert"  # Model name suffix
    )
    
    print(f"✅ Fine-tuning job created!")
    print(f"   Job ID: {response.id}")
    print(f"   Status: {response.status}")
    print(f"   Model: {response.model}")
    
    return response.id

def check_job_status(job_id):
    """Check the status of a fine-tuning job"""
    response = client.fine_tuning.jobs.retrieve(job_id)
    
    print(f"\n📊 Job Status: {response.status}")
    
    if response.status == 'succeeded':
        print(f"✅ Fine-tuning completed!")
        print(f"   Fine-tuned model: {response.fine_tuned_model}")
        print(f"\n💡 Add this to your .env file:")
        print(f"   FT_GPT4O_MINI_MODEL={response.fine_tuned_model}")
        return response.fine_tuned_model
    elif response.status == 'failed':
        print(f"❌ Fine-tuning failed!")
        if response.error:
            print(f"   Error: {response.error}")
    else:
        print(f"⏳ Job is still {response.status}...")
        if response.trained_tokens:
            print(f"   Trained tokens: {response.trained_tokens}")
    
    return None

def list_fine_tuned_models():
    """List all fine-tuned models"""
    print("\n📋 Your fine-tuned models:")
    
    jobs = client.fine_tuning.jobs.list(limit=10)
    
    for job in jobs.data:
        if job.status == 'succeeded':
            print(f"   - {job.fine_tuned_model}")
            print(f"     Base: {job.model}")
            print(f"     Created: {job.created_at}")

def main():
    """Main execution"""
    print("=" * 60)
    print("  OpenAI GPT-4o-mini Fine-Tuning for SQL Generation")
    print("=" * 60)
    
    # Step 1: Upload training file
    training_file = "experiments/datasets/sales_queries.jsonl"
    file_id = upload_training_file(training_file)
    
    # Step 2: Create fine-tuning job
    job_id = create_fine_tune_job(file_id)
    
    print(f"\n📝 Save this information:")
    print(f"   Training File ID: {file_id}")
    print(f"   Job ID: {job_id}")
    
    print(f"\n⏳ Fine-tuning will take 10-30 minutes...")
    print(f"\n💡 To check status later, run:")
    print(f"   python -c \"from finetune_openai_complete import check_job_status; check_job_status('{job_id}')\"")
    
    # Optional: List existing models
    list_fine_tuned_models()

if __name__ == "__main__":
    main()
