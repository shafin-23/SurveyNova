#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install python dependencies
pip install -r requirements.txt

# Download and convert T5 to ONNX (this creates the t5_small_onnx_quantized folder)
python convert_to_onnx.py
