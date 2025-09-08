# Mobilint NPU – Performance Report

## YOLO Series

| Model | Input Size (H, W, C) | mAP | FPS |
|-------|---------------------:|----:|----:|
| yolov5n | (640, 640, 3) | 26.145 | 3,040 |
| yolov5m | (640, 640, 3) | 43.891 | 596 |
| yolov5x | (640, 640, 3) | 49.281 | 177 |
| yolo10b | (640, 640, 3) | 51.125 | 269 |
| yolo11s | (640, 640, 3) | 45.733 | 784 |
| yolo11m | (640, 640, 3) | 50.638 | 340 |
| yolo11l | (640, 640, 3) | 52.468 | 259 |
| yolo11x | (640, 640, 3) | 54.059 | 109 |
| yolo12s | (640, 640, 3) | 46.746 | 342 |
| yolo12m | (640, 640, 3) | 51.568 | 174 |

## LLMs

All metrics are measured by GenAI-Perf from NVIDIA.
The number of input tokens and output tokens were 240 and 10 respectively.

| Model | Time To First Token (ms) | Output Token Throughput Per User (tokens/sec/user) |
|-------|-------------------------:|---------------------------------------------------:|
| c4ai-command-r7b-12-2024            | 4,667.31 | 4.58  |
| EXAONE-3.5-2.4B-Instruct            | 963.86   | 14.23 |
| EXAONE-4.0-1.2B                     | 329.37   | 31.62 |
| EXAONE-Deep-2.4B                    | 886.35   | 13.03 |
| HyperCLOVAX-SEED-Text-Instruct-1.5B | 435.50   | 22.46 |
| Llama-3.1-8B-Instruct               | 4,430.71 | 5.81  |
| Llama-3.2-1B-Instruct               | 430.56   | 30.73 |
| Llama-3.2-3B-Instruct               | 1218.22  | 12.16 |