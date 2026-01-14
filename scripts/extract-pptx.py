#!/usr/bin/env python3
"""
PPTX to JSON Extractor for Handout Site Generator

Extracts content from PowerPoint presentations into a JSON structure
compatible with the React handout site template.

Usage:
    python extract-pptx.py <input.pptx> [output_dir]

Output:
    output_dir/
    ├── presentation.json    (structured content)
    └── media/
        └── {uuid}/          (extracted images and videos)

Limitations:
    - SmartArt diagrams are exported as images (structure not preserved)
    - Animations and transitions are ignored
    - Some complex formatting may be simplified
    - Manual review recommended after extraction
"""

import sys
import os
import json
import uuid
import re
import base64
import argparse
from datetime import datetime
from pathlib import Path

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.shapes import MSO_SHAPE_TYPE
    from pptx.enum.dml import MSO_THEME_COLOR
except ImportError:
    print("Error: python-pptx is required. Install with: pip install python-pptx")
    sys.exit(1)

# Optional: Claude API for image analysis
ANTHROPIC_AVAILABLE = False
anthropic_client = None
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    pass

# Global flag for image analysis
ANALYZE_IMAGES = False


def init_anthropic():
    """Initialize Anthropic client if API key is available."""
    global anthropic_client
    if ANTHROPIC_AVAILABLE and os.environ.get('ANTHROPIC_API_KEY'):
        anthropic_client = anthropic.Anthropic()
        return True
    return False


def analyze_image(image_blob, ext, slide_title=None):
    """
    Analyze image using Claude's vision API.
    Returns a dict with description and optional quote extraction.
    """
    if not anthropic_client:
        return None

    # Map extensions to media types
    media_type_map = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }

    media_type = media_type_map.get(ext.lower())
    if not media_type:
        return None

    try:
        # Encode image to base64
        image_data = base64.standard_b64encode(image_blob).decode('utf-8')

        context = f" from slide '{slide_title}'" if slide_title else ""

        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": f"""Analyze this presentation slide image{context}. Respond in JSON format:

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

Examples:
- Tweet: {{"description": "Tweet screenshot", "has_quote": true, "quote_text": "ChatGPT launched on wednesday. today it crossed 1 million users!", "quote_attribution": "Sam Altman (@sama)"}}
- Slack: {{"description": "Slack message screenshot", "has_quote": true, "quote_text": "ChatGPT went viral. 100k people have tried this so far.", "quote_attribution": "Evan Morikawa, OpenAI"}}
- Chart: {{"description": "Bar chart showing AI adoption rates", "has_quote": false}}

Return ONLY valid JSON, no other text."""
                        }
                    ]
                }
            ]
        )

        # Parse JSON response
        response_text = response.content[0].text.strip()
        # Handle potential markdown code blocks
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
            response_text = response_text.strip()

        result = json.loads(response_text)
        return result

    except json.JSONDecodeError as e:
        print(f"    Warning: Could not parse image analysis JSON: {e}")
        # Return basic description if JSON parsing fails
        return {"description": response.content[0].text.strip() if response else None}
    except Exception as e:
        print(f"    Warning: Image analysis failed: {e}")
        return None


def slugify(text):
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text[:50]


def extract_text_from_shape(shape):
    """Extract text content from a shape."""
    if not shape.has_text_frame:
        return None

    paragraphs = []
    for para in shape.text_frame.paragraphs:
        text = para.text.strip()
        if text:
            # Detect list items by bullet or level
            level = para.level if para.level else 0
            paragraphs.append({
                'text': text,
                'level': level,
                'is_bullet': level > 0 or (para.font and para.font.bold is False)
            })

    return paragraphs if paragraphs else None


def extract_image(shape, media_dir, slide_num, shape_idx, slide_title=None):
    """Extract image from shape and save to media directory."""
    try:
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            image = shape.image
            ext = image.ext
            filename = f"slide_{slide_num}_{shape_idx}.{ext}"
            filepath = media_dir / filename

            with open(filepath, 'wb') as f:
                f.write(image.blob)

            # Analyze image with Claude if enabled
            description = None
            quote_text = None
            quote_attribution = None

            if ANALYZE_IMAGES:
                print(f"    Analyzing image: {filename}...")
                analysis = analyze_image(image.blob, ext, slide_title)
                if analysis:
                    description = analysis.get('description')
                    if analysis.get('has_quote') and analysis.get('quote_text'):
                        quote_text = analysis.get('quote_text')
                        quote_attribution = analysis.get('quote_attribution')
                        print(f"    -> Quote: \"{quote_text[:60]}...\" - {quote_attribution}")
                    elif description:
                        print(f"    -> {description[:80]}...")

            result = {
                'type': 'image',
                'src': f"./{filename}",
                'alt': shape.name or f"Slide {slide_num} image",
                'caption': None,
                'description': description
            }

            # Add quote fields if present
            if quote_text:
                result['quote_text'] = quote_text
                result['quote_attribution'] = quote_attribution

            return result
    except Exception as e:
        print(f"  Warning: Could not extract image: {e}")

    return None


def process_slide(slide, slide_num, media_dir):
    """Process a single slide and extract its content."""
    content = []
    title = None
    notes = ""

    # Extract notes
    if slide.has_notes_slide:
        notes_slide = slide.notes_slide
        if notes_slide.notes_text_frame:
            notes = notes_slide.notes_text_frame.text.strip()

    # Process shapes
    for idx, shape in enumerate(slide.shapes):
        # Title
        if shape.is_placeholder:
            placeholder_type = shape.placeholder_format.type
            if placeholder_type in [1, 3]:  # Title or Center Title
                if shape.has_text_frame:
                    title = shape.text_frame.text.strip()
                    # Clean up special characters
                    title = title.replace('\x0b', ' ').strip()
                continue

        # Text content
        text_content = extract_text_from_shape(shape)
        if text_content:
            # Check if it's a list or heading
            if len(text_content) == 1 and text_content[0]['level'] == 0:
                # Single paragraph - could be heading
                content.append({
                    'type': 'heading',
                    'text': text_content[0]['text'],
                    'level': 2
                })
            else:
                # Multiple items - treat as list
                items = []
                for p in text_content:
                    items.append({
                        'text': p['text'],
                        'children': []
                    })
                if items:
                    content.append({
                        'type': 'list',
                        'style': 'bullet',
                        'items': items
                    })

        # Images
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            img_content = extract_image(shape, media_dir, slide_num, idx, title)
            if img_content:
                content.append(img_content)

        # Tables (simplified extraction)
        if shape.has_table:
            table_text = []
            for row in shape.table.rows:
                row_text = [cell.text.strip() for cell in row.cells]
                table_text.append(' | '.join(row_text))
            if table_text:
                content.append({
                    'type': 'heading',
                    'text': '\n'.join(table_text),
                    'level': 3
                })

    # Determine layout based on content
    layout = "Title and Content"
    if not content:
        layout = "Title Only" if title else "Blank"
    elif any(c['type'] == 'image' for c in content):
        layout = "Two Content"

    return {
        'order': slide_num,
        'title': title or f"Slide {slide_num}",
        'layout': layout,
        'notes': notes,
        'content': content
    }


def detect_sections(prs, slides_data):
    """Attempt to detect sections from slide content."""
    sections = []
    current_section = {
        'title': 'Main Content',
        'slides': []
    }

    for slide_data in slides_data:
        # Check if this looks like a section header
        is_section_header = (
            slide_data['layout'] == 'Title Only' or
            (len(slide_data['content']) == 0 and slide_data['title'])
        )

        if is_section_header and current_section['slides']:
            # Start new section
            sections.append(current_section)
            current_section = {
                'title': slide_data['title'],
                'slides': [slide_data]
            }
        else:
            current_section['slides'].append(slide_data)

    # Add final section
    if current_section['slides']:
        sections.append(current_section)

    return sections


def extract_pptx(input_path, output_dir):
    """Main extraction function."""
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    if not input_path.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)

    # Create output directories
    presentation_id = str(uuid.uuid4())
    media_dir = output_dir / "media" / presentation_id
    media_dir.mkdir(parents=True, exist_ok=True)

    print(f"Extracting: {input_path}")
    print(f"Output to: {output_dir}")
    print(f"Media dir: {media_dir}")
    print()

    # Load presentation
    prs = Presentation(input_path)

    # Process slides
    slides_data = []
    for idx, slide in enumerate(prs.slides, 1):
        print(f"Processing slide {idx}...")
        slide_data = process_slide(slide, idx, media_dir)
        slides_data.append(slide_data)
        if slide_data['title']:
            print(f"  Title: {slide_data['title'][:50]}...")

    print()

    # Detect sections
    sections = detect_sections(prs, slides_data)
    print(f"Detected {len(sections)} sections")

    # Count media files
    media_files = list(media_dir.glob('*'))
    image_count = len([f for f in media_files if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif']])

    # Build output structure
    output = {
        'metadata': {
            'id': presentation_id,
            'source_file': input_path.name,
            'processed_at': datetime.now().isoformat(),
            'stats': {
                'slide_count': len(slides_data),
                'image_count': image_count
            }
        },
        'sections': sections
    }

    # Write JSON
    json_path = output_dir / 'presentation.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 50)
    print("EXTRACTION COMPLETE")
    print("=" * 50)
    print(f"Slides extracted: {len(slides_data)}")
    print(f"Sections detected: {len(sections)}")
    print(f"Images extracted: {image_count}")
    print(f"Output JSON: {json_path}")
    print(f"Media folder: {media_dir}")
    print()
    print("IMPORTANT: Please review the extracted content!")
    print("- Check slide titles are correct")
    print("- Verify section groupings make sense")
    print("- Review any images that may need manual adjustment")
    print("- SmartArt diagrams may need manual recreation")

    return output


def main():
    global ANALYZE_IMAGES

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('input', help='Input PowerPoint file (.pptx)')
    parser.add_argument('output', nargs='?', default='sourcematerials',
                        help='Output directory (default: sourcematerials)')
    parser.add_argument('--analyze-images', action='store_true',
                        help='Analyze images with Claude AI to generate descriptions. '
                             'Requires ANTHROPIC_API_KEY environment variable.')

    args = parser.parse_args()

    # Initialize image analysis if requested
    if args.analyze_images:
        if not ANTHROPIC_AVAILABLE:
            print("Error: --analyze-images requires the anthropic package.")
            print("Install with: pip install anthropic")
            sys.exit(1)

        if not os.environ.get('ANTHROPIC_API_KEY'):
            print("Error: --analyze-images requires ANTHROPIC_API_KEY environment variable.")
            sys.exit(1)

        if init_anthropic():
            ANALYZE_IMAGES = True
            print("Image analysis enabled (using Claude AI)")
            print()
        else:
            print("Warning: Could not initialize Anthropic client. Continuing without image analysis.")

    extract_pptx(args.input, args.output)


if __name__ == "__main__":
    main()
