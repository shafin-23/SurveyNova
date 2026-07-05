import pandas as pd
from collections import Counter
import re
import os
import requests

# Hugging Face API Setup
HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small"
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY") 

def query_huggingface(payload):
    if not HF_API_KEY:
        return None
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=20)
        return response.json()
    except Exception as e:
        print(f"HF API Error: {e}")
        return None

# Allowed Question Types
ALLOWED_TYPES = ["Closed-ended", "MCQ", "Likert", "Open-ended"]

# Detect Question Type
def detect_question_type(answers):
    unique_answers = set(answers)

    if all(str(a).isdigit() for a in answers):
        return "Likert"
    elif unique_answers.issubset({"Yes", "No", "yes", "no"}):
        return "Closed-ended"
    elif 3 <= len(unique_answers) <= 6:
        return "MCQ"
    elif len(unique_answers) > 6:
        return "Open-ended"
    else:
        return "Unsupported"

# Analysis Functions
def analyze_categorical(answers):
    count = Counter(answers)
    total = sum(count.values())
    result_lines = []
    for option, freq in count.items():
        percentage = (freq / total) * 100
        result_lines.append(f"{option}: {freq} responses ({percentage:.2f}%)")
    return "\n".join(result_lines)

def analyze_likert(answers):
    numeric = list(map(int, answers))
    avg = sum(numeric) / len(numeric)
    return (
        f"Average Score: {round(avg,2)}\n"
        f"Minimum: {min(numeric)}\n"
        f"Maximum: {max(numeric)}"
    )

# Clean Professional Open-ended Summary
def analyze_open(answers):
    combined_text = " ".join(answers)

    if not HF_API_KEY:
        # Graceful fallback for local development without API Key
        return "\n\n(Simulated AI Analysis - HUGGINGFACE_API_KEY not set)\nLacks of experienced faculty. Good student friendly environment. Lack of senior faculty. Lack of experienced faculty. Lack of student friendly environment. Lack of bsds department."

    # Using the exact prompt from your original code
    input_text = "summarize: " + combined_text[:3000]

    # Using the exact parameters from your original model.generate code!
    payload = {
        "inputs": input_text,
        "parameters": {
            "max_length": 150,
            "min_length": 40,
            "length_penalty": 2.0,
            "num_beams": 4,
            "early_stopping": True,
            "do_sample": False
        }
    }
    
    # Reverted back to your exact original model: t5-small
    hf_summarizer_url = "https://api-inference.huggingface.co/models/t5-small"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    
    try:
        response = requests.post(hf_summarizer_url, headers=headers, json=payload, timeout=60)
        result = response.json()
    except requests.exceptions.Timeout:
        print("HF API Error: Timeout")
        result = {"error": "timeout", "estimated_time": 60}
    except Exception as e:
        print(f"HF API Error: {e}")
        result = None
    
    if result and isinstance(result, list) and len(result) > 0 and 'summary_text' in result[0]:
        summary = result[0]['summary_text']
    elif result and isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
        summary = result[0]['generated_text']
    elif result and isinstance(result, dict) and 'error' in result:
        # If model is loading, return a message to try again
        summary = f"\n\n(AI Model is currently waking up or taking too long. Please wait {int(result.get('estimated_time', 20))} seconds and click Analyze again!)"
    else:
        summary = "\n\n(AI Analysis Error - HuggingFace API returned an unexpected response.)\nRaw Data Sample: " + combined_text[:300]
    
    # Cleaning
    # Remove Roman numerals i, ii, iii ... x and single 'v' in feedback style
    summary = re.sub(r'\b(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b', '', summary, flags=re.IGNORECASE)

    # Remove extra spaces
    summary = re.sub(r'\s+', ' ', summary).strip()

    # Remove duplicate consecutive words
    summary = re.sub(r'\b(\w+)( \1\b)+', r'\1', summary, flags=re.IGNORECASE)

    # Split sentences
    sentences = re.split(r'\.+', summary)
    cleaned_sentences = []
    seen = set()

    for s in sentences:
        s = s.strip()
        if not s:
            continue
        s = s.capitalize()
        if s.lower() not in seen:
            cleaned_sentences.append(s)
            seen.add(s.lower())

    final_summary = ". ".join(cleaned_sentences) + "."

    # Strict 20 words per line formatting
    words = final_summary.split()
    lines = []

    for i in range(0, len(words), 20):
        line = " ".join(words[i:i+20])
        lines.append(line)

    formatted_summary = "\n".join(lines)

    return "\n\n" + formatted_summary

# Column-wise Survey Analyzer
def analyze_survey_columns(csv_file):
    df = pd.read_csv(csv_file)

    for col in df.columns:
        question = col
        answers = df[col].dropna().astype(str).tolist()
        q_type = detect_question_type(answers)

        print("\n" + "="*80)
        print(f"Question: {question}")
        print(f"Detected Type: {q_type}")
        print("-"*80)

        if q_type not in ALLOWED_TYPES:
            print("Result: Unsupported Question Type – Skipped")
            print("="*80)
            continue

        if q_type in ["Closed-ended", "MCQ"]:
            result = analyze_categorical(answers)
        elif q_type == "Likert":
            result = analyze_likert(answers)
        elif q_type == "Open-ended":
            result = analyze_open(answers)

        print("Result:")
        print(result)
        print("="*80)

# Run
if __name__ == "__main__":
    analyze_survey_columns("Survey form.csv")