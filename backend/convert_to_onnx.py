from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForSeq2SeqLM
from optimum.onnxruntime.configuration import QuantizationConfig
from optimum.onnxruntime import ORTQuantizer
import os

model_id = "t5-small"
save_dir = "t5_small_onnx"
quantized_dir = "t5_small_onnx_quantized"

print("1. Downloading and converting T5-small to ONNX format...")
# Load tokenizer and export model to ONNX
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = ORTModelForSeq2SeqLM.from_pretrained(model_id, export=True)

# Save the unquantized ONNX model
tokenizer.save_pretrained(save_dir)
model.save_pretrained(save_dir)

print("2. Quantizing the model to INT8 to reduce size by 4x...")
# Set up quantizers for encoder and decoder
qconfig = QuantizationConfig.create_dynamic(
    is_static=False,
    per_channel=True,
    reduce_range=False,
    weight_type=2 # INT8
)

# Quantize the exported model
# ORTQuantizer handles the complex multi-file T5 structure
encoder_quantizer = ORTQuantizer.from_pretrained(save_dir, file_name="encoder_model.onnx")
encoder_quantizer.quantize(save_dir=quantized_dir, quantization_config=qconfig)

decoder_quantizer = ORTQuantizer.from_pretrained(save_dir, file_name="decoder_model.onnx")
decoder_quantizer.quantize(save_dir=quantized_dir, quantization_config=qconfig)

decoder_wp_quantizer = ORTQuantizer.from_pretrained(save_dir, file_name="decoder_model_merged.onnx")
try:
    decoder_wp_quantizer.quantize(save_dir=quantized_dir, quantization_config=qconfig)
except Exception as e:
    print("Merged decoder not found, trying legacy separate decoder with past...")
    try:
        decoder_wp_quantizer = ORTQuantizer.from_pretrained(save_dir, file_name="decoder_with_past_model.onnx")
        decoder_wp_quantizer.quantize(save_dir=quantized_dir, quantization_config=qconfig)
    except Exception as e2:
        print("Warning: Could not quantize decoder_with_past:", e2)

# Save tokenizer to the quantized directory
tokenizer.save_pretrained(quantized_dir)

print("\nConversion and Quantization Complete!")
print(f"Your optimized ONNX model is saved in: {quantized_dir}")
print("You can now safely delete the unquantized 't5_small_onnx' folder to save space.")
