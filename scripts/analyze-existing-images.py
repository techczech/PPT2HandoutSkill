#!/usr/bin/env python3
"""
Analyze existing images in presentation.json and add descriptions.
Uses Gemini 3 Flash Preview for image analysis.
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime

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
model = genai.GenerativeModel('gemini-2.0-flash')

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


def analyze_image(image_path, slide_title=None):
    """Analyze image using Gemini's vision API."""
    global total_input_tokens, total_output_tokens

    try:
        image = Image.open(image_path)
        context = f" from slide '{slide_title}'" if slide_title else ""

        categories_list = ", ".join(VALID_CATEGORIES)

        prompt = f"""Analyze this presentation slide image{context}. Respond in JSON format:

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

        response = model.generate_content([prompt, image])
        response_text = response.text.strip()

        # Track token usage if available
        if hasattr(response, 'usage_metadata'):
            total_input_tokens += getattr(response.usage_metadata, 'prompt_token_count', 0)
            total_output_tokens += getattr(response.usage_metadata, 'candidates_token_count', 0)

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
        return {"description": response.text.strip() if response else None, "category": "other"}
    except Exception as e:
        print(f"    Warning: Analysis failed: {e}")
        return None


def main():
    global total_input_tokens, total_output_tokens

    if len(sys.argv) < 2:
        print("Usage: python analyze-existing-images.py <site_directory>")
        print("Example: python analyze-existing-images.py /path/to/threeyearsafterchatgpt")
        sys.exit(1)

    site_dir = Path(sys.argv[1])
    json_path = site_dir / "src" / "data" / "presentation.json"
    stats_path = site_dir / "src" / "data" / "processingStats.json"
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
    print(f"Using Gemini 2.0 Flash")
    print()

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
                        images_skipped += 1
                        continue

                    print(f"  Analyzing: {src} (Slide: {slide_title[:40]}...)")

                    result = analyze_image(image_path, slide_title)

                    if result:
                        content['description'] = result.get('description')
                        content['category'] = result.get('category', 'other')

                        # Track category
                        category_counts[content['category']] = category_counts.get(content['category'], 0) + 1

                        if result.get('has_quote') and result.get('quote_text'):
                            content['quote_text'] = result.get('quote_text')
                            content['quote_attribution'] = result.get('quote_attribution')
                            quotes_found += 1
                            print(f"    -> [{content['category']}] Quote: \"{result['quote_text'][:50]}...\"")
                        elif result.get('description'):
                            print(f"    -> [{content['category']}] {result['description'][:60]}...")

                    images_processed += 1

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # Save updated presentation
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Generate processing stats
    stats = {
        "processedAt": end_time.isoformat(),
        "model": "gemini-2.0-flash",
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

    # Save stats
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)

    print()
    print("=" * 50)
    print("ANALYSIS COMPLETE")
    print("=" * 50)
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
    print(f"Token usage:")
    print(f"  Input tokens: {total_input_tokens:,}")
    print(f"  Output tokens: {total_output_tokens:,}")
    print(f"  Total tokens: {total_input_tokens + total_output_tokens:,}")
    print()
    print(f"Updated: {json_path}")
    print(f"Stats saved: {stats_path}")


if __name__ == "__main__":
    main()
