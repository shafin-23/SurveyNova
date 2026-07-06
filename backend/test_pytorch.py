from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import re

def test_pytorch_summary(text):
    print("Loading PyTorch Model (T5-Small)...")
    model_name = "t5-small"
    
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model = T5ForConditionalGeneration.from_pretrained(model_name)
    
    print("Model loaded successfully!")
    
    input_text = (
        "Write a clear professional summary in around one hundred fifty words "
        "without numbering or special symbols and avoid repetition: "
        + text
    )

    print("Generating summary...")
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True
    )
    
    outputs = model.generate(
        **inputs,
        max_length=200,
        min_length=20,
        num_beams=4,
        length_penalty=2.0,
        early_stopping=True
    )

    summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    print("\n--- RAW OUTPUT ---")
    print(summary)
    
    # Cleaning steps
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
    
    print("\n--- CLEANED OUTPUT ---")
    print(final_summary)


if __name__ == "__main__":
    sample_text = "The course was very interesting and the teacher explained things very well. However, the exams were too difficult and some questions were outside the syllabus. Overall a good experience but grading should be fairer."
    test_pytorch_summary(sample_text)
