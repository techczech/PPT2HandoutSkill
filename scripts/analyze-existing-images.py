#!/usr/bin/env python3
"""
Analyze existing images in presentation.json and add descriptions.
Supports multiple backends:
  - Gemini 3 Flash Preview (cloud, requires GEMINI_API_KEY)
  - LM Studio (local, OpenAI-compatible API at localhost:1234)
  - Ollama (local, API at localhost:11434)

Priority: LM Studio > Ollama > Gemini (unless explicitly specified)
"""

import sys
import os
import json
import base64
import argparse
from pathlib import Path
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError
from typing import Optional, Tuple

# Valid image categories
VALID_CATEGORIES = [
    "cartoon",
    "interface_screenshot",
    "chat_screenshot",
    "tweet",
    "quote",
    "academic_paper",
    "diagram",
    "chart",
    "photo_person",
    "book_cover",
    "product_page",
    "other"
]

# Token tracking
total_input_tokens = 0
total_output_tokens = 0

# Backend configuration
LMSTUDIO_URL = "http://localhost:1234"
OLLAMA_URL = "http://localhost:11434"


def check_lmstudio_available() -> bool:
    """Check if LM Studio server is running."""
    try:
        req = Request(f"{LMSTUDIO_URL}/v1/models", method="GET")
        with urlopen(req, timeout=2) as response:
            return response.status == 200
    except (URLError, OSError):
        return False


def check_ollama_available() -> bool:
    """Check if Ollama server is running."""
    try:
        req = Request(f"{OLLAMA_URL}/api/tags", method="GET")
        with urlopen(req, timeout=2) as response:
            return response.status == 200
    except (URLError, OSError):
        return False


def get_lmstudio_models() -> list[dict]:
    """Get list of available vision models from LM Studio using v0 API."""
    try:
        # Try v0 API first (has type field for vision detection)
        req = Request(f"{LMSTUDIO_URL}/api/v0/models", method="GET")
        with urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            models = []
            for m in data.get("data", []):
                # type "vlm" indicates vision-language model
                if m.get("type") == "vlm":
                    models.append({"id": m["id"], "name": m.get("id", "Unknown")})
            return models
    except (URLError, OSError, json.JSONDecodeError):
        # Fall back to v1 API (no vision filtering)
        try:
            req = Request(f"{LMSTUDIO_URL}/v1/models", method="GET")
            with urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                return [{"id": m["id"], "name": m.get("id", "Unknown")} for m in data.get("data", [])]
        except (URLError, OSError, json.JSONDecodeError):
            return []


def get_ollama_model_families(model_name: str) -> list[str]:
    """Get the model families from Ollama's show endpoint."""
    try:
        req = Request(
            f"{OLLAMA_URL}/api/show",
            data=json.dumps({"name": model_name}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return data.get("details", {}).get("families", [])
    except (URLError, OSError, json.JSONDecodeError):
        return []


def is_ollama_vision_model(families: list[str]) -> bool:
    """Check if Ollama model families indicate vision capability."""
    if not families:
        return False
    vision_indicators = ["clip", "mllama"]
    for family in families:
        family_lower = family.lower()
        # Check for known vision families
        if family_lower in vision_indicators:
            return True
        # Check for vision-language family suffix (e.g., qwen25vl, qwen3vl)
        if family_lower.endswith("vl"):
            return True
    return False


def get_ollama_models() -> list[dict]:
    """Get list of available vision models from Ollama."""
    try:
        req = Request(f"{OLLAMA_URL}/api/tags", method="GET")
        with urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            models = []
            for m in data.get("models", []):
                name = m.get("name", "")
                families = get_ollama_model_families(name)
                if is_ollama_vision_model(families):
                    models.append({"id": name, "name": name, "families": families})
            return models
    except (URLError, OSError, json.JSONDecodeError):
        return []


def list_available_backends() -> dict:
    """List all available backends and their models."""
    backends = {}

    # Check LM Studio
    if check_lmstudio_available():
        models = get_lmstudio_models()
        if models:
            backends["lmstudio"] = {"url": LMSTUDIO_URL, "models": models}

    # Check Ollama
    if check_ollama_available():
        models = get_ollama_models()
        if models:
            backends["ollama"] = {"url": OLLAMA_URL, "models": models}

    # Check Gemini
    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if api_key:
        backends["gemini"] = {"models": [{"id": "gemini-3-flash-preview", "name": "Gemini 3 Flash Preview"}]}

    return backends


def encode_image_base64(image_path: Path) -> Tuple[str, str]:
    """Encode image to base64 and determine MIME type."""
    suffix = image_path.suffix.lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
    }
    mime_type = mime_types.get(suffix, "image/jpeg")

    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    return image_data, mime_type


def get_analysis_prompt(slide_title: Optional[str] = None) -> str:
    """Generate the analysis prompt."""
    context = f" from slide '{slide_title}'" if slide_title else ""
    categories_list = ", ".join(VALID_CATEGORIES)

    return f"""Analyze this presentation slide image{context}. Respond in JSON format:

{{
  "description": "Brief description of what the image shows (50-100 words)",
  "category": "one of: {categories_list}",
  "has_quote": true/false,
  "quote_text": "The verbatim quote/message text if present",
  "quote_attribution": "Who said it (name, @handle, title)"
}}

Category definitions:
- cartoon: Illustrations, drawings, comics, memes with drawn characters
- interface_screenshot: Software UI, app interfaces, website screenshots
- chat_screenshot: Slack, Teams, Discord, or other chat app messages
- tweet: Twitter/X posts
- quote: Text-based quotes or blockquotes
- academic_paper: Research paper pages, citations, abstracts
- diagram: Technical diagrams, flowcharts, architecture diagrams
- chart: Data visualizations, graphs, bar charts, line charts
- photo_person: Photographs of people
- book_cover: Book covers, ebook covers
- product_page: E-commerce or product listing pages
- other: Anything that doesn't fit above categories

Focus on:
1. Tweets - extract the full tweet text and @handle
2. Slack/chat messages - extract the message and sender name
3. Screenshots with quotes - extract any quotable statements
4. Social media posts - extract the post content and author

Return ONLY valid JSON, no other text."""


def analyze_with_gemini(image_path: Path, slide_title: Optional[str] = None) -> Optional[dict]:
    """Analyze image using Gemini API."""
    global total_input_tokens, total_output_tokens

    try:
        from google import genai
        from PIL import Image
    except ImportError:
        print("Error: google-genai and Pillow required for Gemini backend")
        print("Install with: pip install google-genai Pillow")
        return None

    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY or GOOGLE_API_KEY environment variable required")
        return None

    try:
        client = genai.Client(api_key=api_key)
        image = Image.open(image_path)
        prompt = get_analysis_prompt(slide_title)

        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=[prompt, image]
        )

        response_text = (response.text or "").strip()

        if hasattr(response, 'usage_metadata'):
            total_input_tokens += getattr(response.usage_metadata, 'prompt_token_count', 0)
            total_output_tokens += getattr(response.usage_metadata, 'candidates_token_count', 0)

        return parse_json_response(response_text)
    except Exception as e:
        print(f"    Warning: Gemini analysis failed: {e}")
        return None


def analyze_with_lmstudio(image_path: Path, model: str, slide_title: Optional[str] = None) -> Optional[dict]:
    """Analyze image using LM Studio (OpenAI-compatible API)."""
    global total_input_tokens, total_output_tokens

    try:
        image_data, mime_type = encode_image_base64(image_path)
        prompt = get_analysis_prompt(slide_title)

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.1
        }

        req = Request(
            f"{LMSTUDIO_URL}/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode())
            response_text = data["choices"][0]["message"]["content"].strip()

            # Track tokens if available
            if "usage" in data:
                total_input_tokens += data["usage"].get("prompt_tokens", 0)
                total_output_tokens += data["usage"].get("completion_tokens", 0)

            return parse_json_response(response_text)
    except Exception as e:
        print(f"    Warning: LM Studio analysis failed: {e}")
        return None


def analyze_with_ollama(image_path: Path, model: str, slide_title: Optional[str] = None) -> Optional[dict]:
    """Analyze image using Ollama API."""
    global total_input_tokens, total_output_tokens

    try:
        image_data, _ = encode_image_base64(image_path)
        prompt = get_analysis_prompt(slide_title)

        payload = {
            "model": model,
            "prompt": prompt,
            "images": [image_data],
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        }

        req = Request(
            f"{OLLAMA_URL}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode())
            response_text = data.get("response", "").strip()

            # Track tokens if available
            total_input_tokens += data.get("prompt_eval_count", 0)
            total_output_tokens += data.get("eval_count", 0)

            return parse_json_response(response_text)
    except Exception as e:
        print(f"    Warning: Ollama analysis failed: {e}")
        return None


def parse_json_response(response_text: str) -> Optional[dict]:
    """Parse JSON from model response, handling markdown code blocks."""
    try:
        # Handle markdown code blocks
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()

        result = json.loads(response_text)

        # Validate category
        if result.get('category') not in VALID_CATEGORIES:
            result['category'] = 'other'

        return result
    except json.JSONDecodeError as e:
        print(f"    Warning: Could not parse JSON: {e}")
        return {"description": response_text[:500] if response_text else None, "category": "other"}


def analyze_image(image_path: Path, backend: str, model: str, slide_title: Optional[str] = None) -> Optional[dict]:
    """Analyze image using the specified backend."""
    if backend == "gemini":
        return analyze_with_gemini(image_path, slide_title)
    elif backend == "lmstudio":
        return analyze_with_lmstudio(image_path, model, slide_title)
    elif backend == "ollama":
        return analyze_with_ollama(image_path, model, slide_title)
    else:
        print(f"Error: Unknown backend '{backend}'")
        return None


def main():
    global total_input_tokens, total_output_tokens

    parser = argparse.ArgumentParser(
        description="Analyze images in presentation.json using vision models",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List available backends and models
  python analyze-existing-images.py --list

  # Auto-detect best available backend
  python analyze-existing-images.py /path/to/site

  # Use specific backend and model
  python analyze-existing-images.py /path/to/site --backend lmstudio --model "llava-v1.6"
  python analyze-existing-images.py /path/to/site --backend ollama --model "llava:13b"
  python analyze-existing-images.py /path/to/site --backend gemini
"""
    )
    parser.add_argument("site_dir", nargs="?", help="Site directory containing src/data/presentation.json")
    parser.add_argument("--list", action="store_true", help="List available backends and models")
    parser.add_argument("--backend", choices=["lmstudio", "ollama", "gemini"], help="Backend to use")
    parser.add_argument("--model", help="Model ID to use (required for lmstudio/ollama)")
    parser.add_argument("--json", action="store_true", help="Output --list results as JSON")

    args = parser.parse_args()

    # List mode
    if args.list:
        backends = list_available_backends()

        if args.json:
            print(json.dumps(backends, indent=2))
        else:
            if not backends:
                print("No backends available.")
                print("\nTo use this script, you need one of:")
                print("  - LM Studio running at localhost:1234 with a vision model")
                print("  - Ollama running at localhost:11434 with a vision model (llava, etc.)")
                print("  - GEMINI_API_KEY environment variable set")
                sys.exit(1)

            print("Available backends and models:\n")
            for backend, info in backends.items():
                print(f"  {backend}:")
                for model in info["models"]:
                    print(f"    - {model['id']}")
                print()
        return

    # Require site_dir for analysis
    if not args.site_dir:
        parser.print_help()
        sys.exit(1)

    site_dir = Path(args.site_dir)
    json_path = site_dir / "src" / "data" / "presentation.json"
    stats_path = site_dir / "src" / "data" / "processingStats.json"

    if not json_path.exists():
        print(f"Error: presentation.json not found at {json_path}")
        sys.exit(1)

    # Determine backend and model
    backend = args.backend
    model = args.model

    if not backend:
        # Auto-detect: LM Studio > Ollama > Gemini
        backends = list_available_backends()

        if "lmstudio" in backends:
            backend = "lmstudio"
            model = model or backends["lmstudio"]["models"][0]["id"]
            print(f"Auto-detected: LM Studio with model '{model}'")
        elif "ollama" in backends:
            backend = "ollama"
            model = model or backends["ollama"]["models"][0]["id"]
            print(f"Auto-detected: Ollama with model '{model}'")
        elif "gemini" in backends:
            backend = "gemini"
            model = "gemini-3-flash-preview"
            print("Auto-detected: Gemini API")
        else:
            print("Error: No backends available.")
            print("Run with --list to see requirements.")
            sys.exit(1)
    elif backend in ["lmstudio", "ollama"] and not model:
        # Need to get model list
        backends = list_available_backends()
        if backend not in backends:
            print(f"Error: {backend} is not available")
            sys.exit(1)
        model = backends[backend]["models"][0]["id"]
        print(f"Using first available model: {model}")
    elif backend == "gemini":
        model = "gemini-3-flash-preview"

    print(f"\nUsing backend: {backend}")
    print(f"Using model: {model}")
    print()

    # Load presentation
    print("Loading presentation.json...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data.get('sections', []))} sections")

    public_dir = site_dir / "public"

    # Process all sections and slides
    images_processed = 0
    images_skipped = 0
    quotes_found = 0
    category_counts = {cat: 0 for cat in VALID_CATEGORIES}
    start_time = datetime.now()

    for section in data['sections']:
        for slide in section['slides']:
            slide_title = slide.get('title', '')

            for content in slide.get('content', []):
                if content.get('type') == 'image':
                    src = content.get('src', '')

                    # Handle different path formats
                    if src.startswith('/'):
                        image_path = public_dir / src.lstrip('/')
                    elif src.startswith('./'):
                        image_path = public_dir / src[2:]
                    else:
                        image_path = public_dir / src

                    if not image_path.exists():
                        print(f"  Warning: Image not found: {image_path}")
                        continue

                    # Skip if already analyzed
                    if content.get('description') and content.get('category'):
                        print(f"  Skipping (already analyzed): {src}")
                        images_skipped += 1
                        continue

                    print(f"  Analyzing: {src} (Slide: {slide_title[:40]}...)")
                    sys.stdout.flush()

                    result = analyze_image(image_path, backend, model, slide_title)

                    if result:
                        content['description'] = result.get('description')
                        content['category'] = result.get('category', 'other')

                        category_counts[content['category']] = category_counts.get(content['category'], 0) + 1

                        if result.get('has_quote') and result.get('quote_text'):
                            content['quote_text'] = result.get('quote_text')
                            content['quote_attribution'] = result.get('quote_attribution')
                            quotes_found += 1
                            print(f"    -> [{content['category']}] Quote: \"{result['quote_text'][:50]}...\"")
                        elif result.get('description'):
                            print(f"    -> [{content['category']}] {result['description'][:60]}...")

                        sys.stdout.flush()

                    images_processed += 1

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # Save updated presentation
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Generate processing stats
    stats = {
        "processedAt": end_time.isoformat(),
        "backend": backend,
        "model": model,
        "imagesProcessed": images_processed,
        "imagesSkipped": images_skipped,
        "quotesExtracted": quotes_found,
        "categoryCounts": {k: v for k, v in category_counts.items() if v > 0},
        "tokensUsed": {
            "input": total_input_tokens,
            "output": total_output_tokens,
            "total": total_input_tokens + total_output_tokens
        },
        "durationSeconds": round(duration, 2)
    }

    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)

    print()
    print("=" * 50)
    print("ANALYSIS COMPLETE")
    print("=" * 50)
    print(f"Backend: {backend} ({model})")
    print(f"Images analyzed: {images_processed}")
    print(f"Images skipped: {images_skipped}")
    print(f"Quotes extracted: {quotes_found}")
    print(f"Duration: {duration:.1f} seconds")
    print()
    print("Category breakdown:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        if count > 0:
            print(f"  {cat}: {count}")
    print()
    if total_input_tokens or total_output_tokens:
        print(f"Token usage:")
        print(f"  Input tokens: {total_input_tokens:,}")
        print(f"  Output tokens: {total_output_tokens:,}")
        print(f"  Total tokens: {total_input_tokens + total_output_tokens:,}")
        print()
    print(f"Updated: {json_path}")
    print(f"Stats saved: {stats_path}")


if __name__ == "__main__":
    main()
