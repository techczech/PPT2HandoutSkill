#!/usr/bin/env python3
"""
Analyze existing images in presentation.json and add descriptions.
Uses Gemini 3 Flash Preview for image analysis.
"""

import sys
import os
import json
from pathlib import Path

try:
    import google.generativeai as genai
    from PIL import Image
except ImportError:
    print("Error: Required packages not installed.")
    print("Install with: pip install google-generativeai Pillow")
    sys.exit(1)

# Initialize Gemini
api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY or GOOGLE_API_KEY environment variable required.")
    sys.exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-3-flash-preview')


def analyze_image(image_path, slide_title=None):
    """Analyze image using Gemini's vision API."""
    try:
        image = Image.open(image_path)
        context = f" from slide '{slide_title}'" if slide_title else ""

        prompt = f"""Analyze this presentation slide image{context}. Respond in JSON format:

{{
  "description": "Brief description of what the image shows",
  "has_quote": true/false,
  "quote_text": "The verbatim quote/message text if present",
  "quote_attribution": "Who said it (name, @handle, title)"
}}

Focus on:
1. Tweets - extract the full tweet text and @handle
2. Slack/chat messages - extract the message and sender name
3. Screenshots with quotes - extract any quotable statements
4. Social media posts - extract the post content and author

Return ONLY valid JSON, no other text."""

        response = model.generate_content([prompt, image])
        response_text = response.text.strip()

        # Handle markdown code blocks
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()

        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"    Warning: Could not parse JSON: {e}")
        return {"description": response.text.strip() if response else None}
    except Exception as e:
        print(f"    Warning: Analysis failed: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze-existing-images.py <site_directory>")
        print("Example: python analyze-existing-images.py /path/to/threeyearsafterchatgpt")
        sys.exit(1)

    site_dir = Path(sys.argv[1])
    json_path = site_dir / "src" / "data" / "presentation.json"
    print(f"Looking for: {json_path}")
    sys.stdout.flush()

    if not json_path.exists():
        print(f"Error: presentation.json not found at {json_path}")
        sys.exit(1)

    # Load presentation
    print("Loading presentation.json...")
    sys.stdout.flush()
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data.get('sections', []))} sections")
    sys.stdout.flush()

    # The public directory is where static assets are served from
    public_dir = site_dir / "public"
    print(f"Site directory: {site_dir}")
    print(f"Public directory: {public_dir}")
    print(f"Using Gemini 3 Flash Preview")
    print()

    # Process all sections and slides
    images_processed = 0
    quotes_found = 0

    for section in data['sections']:
        for slide in section['slides']:
            slide_title = slide.get('title', '')

            for content in slide.get('content', []):
                if content.get('type') == 'image':
                    src = content.get('src', '')

                    # Handle different path formats
                    if src.startswith('/'):
                        # Absolute path from public root (e.g., /assets/images/slides/...)
                        image_path = public_dir / src.lstrip('/')
                    elif src.startswith('./'):
                        # Relative path
                        image_path = public_dir / src[2:]
                    else:
                        image_path = public_dir / src

                    if not image_path.exists():
                        print(f"  Warning: Image not found: {image_path}")
                        continue

                    # Skip if already analyzed
                    if content.get('description'):
                        print(f"  Skipping (already analyzed): {src}")
                        continue

                    print(f"  Analyzing: {src} (Slide: {slide_title[:40]}...)")

                    result = analyze_image(image_path, slide_title)

                    if result:
                        content['description'] = result.get('description')

                        if result.get('has_quote') and result.get('quote_text'):
                            content['quote_text'] = result.get('quote_text')
                            content['quote_attribution'] = result.get('quote_attribution')
                            quotes_found += 1
                            print(f"    -> Quote: \"{result['quote_text'][:50]}...\" - {result.get('quote_attribution')}")
                        elif result.get('description'):
                            print(f"    -> {result['description'][:60]}...")

                    images_processed += 1

    # Save updated presentation
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 50)
    print("ANALYSIS COMPLETE")
    print("=" * 50)
    print(f"Images analyzed: {images_processed}")
    print(f"Quotes extracted: {quotes_found}")
    print(f"Updated: {json_path}")


if __name__ == "__main__":
    main()
