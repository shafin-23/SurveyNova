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

    try:
        from transformers import AutoTokenizer
        from optimum.onnxruntime import ORTModelForSeq2SeqLM
    except ImportError:
        return "\n\n(AI Analysis Error - Required libraries not installed. Please check build logs.)"
        
    model_dir = "t5_small_onnx_quantized"
    
    if not os.path.exists(model_dir):
        return "\n\n(AI Analysis Error - ONNX model not found. The model must be generated during the build step.)"

    try:
        tokenizer = AutoTokenizer.from_pretrained(model_dir)
        model = ORTModelForSeq2SeqLM.from_pretrained(model_dir)
    except Exception as e:
        return f"\n\n(AI Analysis Error - Failed to load ONNX model: {str(e)})"
        
    input_text = (
        "Write a clear professional summary in around one hundred fifty words "
        "without numbering or special symbols and avoid repetition: "
        + combined_text[:3000]
    )

    try:
        inputs = tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True
        )
        
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=200,
            min_length=20,
            num_beams=4,
            length_penalty=2.0,
            early_stopping=True
        )

        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
    except Exception as e:
        return f"\n\n(AI Analysis Error - Failed to generate summary: {str(e)})"
    
    # Cleaning
    summary = re.sub(r'\d+', '', summary)
    summary = re.sub(r'\b(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b', '', summary, flags=re.IGNORECASE)
    summary = re.sub(r'[^A-Za-z. ]+', '', summary)
    summary = re.sub(r'\s+', ' ', summary).strip()
    summary = re.sub(r'\b(\w+)( \1\b)+', r'\1', summary, flags=re.IGNORECASE)

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