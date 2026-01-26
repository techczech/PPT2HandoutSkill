#!/usr/bin/env python3
"""
PPTX to JSON Extractor for Handout Site Generator

Extracts content from PowerPoint presentations into a JSON structure
compatible with the React handout site template.

Usage:
    python extract-pptx.py <input.pptx> [output_dir]
    python extract-pptx.py <input.pptx> [output_dir] --analyze-images

Output:
    output_dir/
    ├── presentation.json    (structured content)
    └── media/
        └── {uuid}/          (extracted images and videos)

Features:
    - Text extraction with formatting (bold, italic, underline, colors, hyperlinks)
    - Auto shape extraction (arrows, connectors, symbols like ≠, +, -, etc.)
    - Shape properties (position, colors, rotation, animation order)
    - Image extraction with optional AI-powered analysis
    - Table extraction
    - Speaker notes extraction
    - Section detection from slide structure

Text Formatting:
    List items and headings include a 'runs' array when formatting is present:
    [{"text": "plain"}, {"text": "bold", "bold": true}, {"text": "text"}]

Shape Extraction:
    Meaningful shapes (arrows, symbols, connectors) are extracted with:
    - shape_type: auto shape type (e.g., "right_arrow", "math_not_equal")
    - shape_name: PowerPoint shape name
    - position: {left, top, width, height} in EMUs
    - fill_color, line_color: hex colors
    - rotation: angle in degrees
    - animation_order: entry order in animations (1-based)

Limitations:
    - SmartArt diagrams are exported as images (structure not preserved)
    - Complex animations are simplified to just entry order
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


def extract_formatted_runs(paragraph):
    """Extract ALL text runs with formatting from a paragraph.

    Returns list of TextRun dicts only if there's any formatting,
    otherwise returns empty list (plain text is already in 'text' field).
    """
    runs = []
    has_any_formatting = False

    try:
        for run in paragraph.runs:
            if not run.text:
                continue

            # Get formatting
            bold = run.font.bold if run.font.bold is not None else False
            italic = run.font.italic if run.font.italic is not None else False
            underline = run.font.underline is not None and run.font.underline

            # Get URL if present
            url = None
            if hasattr(run, 'hyperlink') and run.hyperlink and run.hyperlink.address:
                url = run.hyperlink.address

            # Get font color
            font_color = None
            try:
                if run.font.color and run.font.color.rgb:
                    font_color = str(run.font.color.rgb)
            except Exception:
                pass

            # Track if any run has formatting
            if bold or italic or underline or url or font_color:
                has_any_formatting = True

            # Include ALL runs to preserve full text
            run_dict = {'text': run.text}
            if bold:
                run_dict['bold'] = True
            if italic:
                run_dict['italic'] = True
            if underline:
                run_dict['underline'] = True
            if url:
                run_dict['url'] = url
            if font_color:
                run_dict['font_color'] = font_color
            runs.append(run_dict)
    except Exception as e:
        print(f"    Warning: Could not extract formatted runs: {e}")

    return runs if has_any_formatting else []


def extract_animation_map(slide):
    """Extract animation order for shapes on a slide.

    Returns dict mapping shape_id -> animation_order (1-based).
    """
    animation_map = {}
    try:
        slide_elem = slide._element
        ns = {
            'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
        }

        timing = slide_elem.find('.//p:timing', ns)
        if timing is None:
            return animation_map

        seq = timing.find('.//p:seq', ns)
        if seq is None:
            return animation_map

        order = 0
        for child_tn_lst in seq.findall('.//p:childTnLst', ns):
            for par in child_tn_lst.findall('p:par', ns):
                for tgt_el in par.findall('.//p:tgtEl', ns):
                    sp_tgt = tgt_el.find('p:spTgt', ns)
                    if sp_tgt is not None:
                        shape_id_str = sp_tgt.get('spid')
                        if shape_id_str:
                            order += 1
                            shape_id = int(shape_id_str)
                            if shape_id not in animation_map:
                                animation_map[shape_id] = order
    except Exception as e:
        print(f"    Warning: Could not extract animation map: {e}")

    return animation_map


def extract_auto_shape(shape, animation_map):
    """Extract auto shape (arrow, connector, symbol, etc.).

    Returns ShapeBlock dict if this is a meaningful auto shape, None otherwise.
    """
    try:
        shape_type_val = shape.shape_type

        shape_type_names = {
            1: "auto_shape",
            2: "callout",
            5: "freeform",
            9: "line",
            19: "text_box",
            21: "connector",
        }

        # Skip types we handle elsewhere
        skip_types = {6, 7, 13, 14, 16, 17, 18, 19}
        if shape_type_val in skip_types:
            return None

        shape_name = shape.name if hasattr(shape, 'name') else ""

        meaningful_keywords = [
            'arrow', 'connector', 'line', 'equal', 'plus', 'minus',
            'chevron', 'block', 'star', 'heart', 'lightning', 'sun',
            'callout', 'bubble', 'cloud', 'oval', 'rectangle', 'triangle',
            'pentagon', 'hexagon', 'cross', 'notequal', 'not equal'
        ]

        name_lower = shape_name.lower()
        is_meaningful = any(kw in name_lower for kw in meaningful_keywords)

        auto_shape_type = None
        if hasattr(shape, 'auto_shape_type') and shape.auto_shape_type:
            auto_shape_type = str(shape.auto_shape_type).split('.')[-1].lower()
            is_meaningful = is_meaningful or auto_shape_type not in ('rectangle', 'rounded_rectangle')

        if not is_meaningful and shape_type_val == 1:
            try:
                if hasattr(shape, 'fill') and shape.fill:
                    fill_type = shape.fill.type
                    if fill_type is None:
                        return None
            except Exception:
                return None

        if not is_meaningful:
            return None

        # Get position
        left = shape.left if hasattr(shape, 'left') and shape.left else 0
        top = shape.top if hasattr(shape, 'top') and shape.top else 0
        width = shape.width if hasattr(shape, 'width') and shape.width else 0
        height = shape.height if hasattr(shape, 'height') and shape.height else 0

        # Get text inside shape
        text = ""
        runs = []
        if shape.has_text_frame and shape.text_frame.text.strip():
            text = shape.text_frame.text.strip()
            for p in shape.text_frame.paragraphs:
                runs.extend(extract_formatted_runs(p))

        # Get colors
        fill_color = None
        line_color = None
        try:
            if hasattr(shape, 'fill') and shape.fill and shape.fill.fore_color:
                if shape.fill.fore_color.rgb:
                    fill_color = str(shape.fill.fore_color.rgb)
        except Exception:
            pass

        try:
            if hasattr(shape, 'line') and shape.line and shape.line.color:
                if shape.line.color.rgb:
                    line_color = str(shape.line.color.rgb)
        except Exception:
            pass

        # Get rotation
        rotation = 0.0
        if hasattr(shape, 'rotation'):
            rotation = shape.rotation or 0.0

        # Get animation order
        animation_order = None
        shape_id = shape.shape_id if hasattr(shape, 'shape_id') else None
        if shape_id and shape_id in animation_map:
            animation_order = animation_map[shape_id]

        result = {
            'type': 'shape',
            'shape_type': auto_shape_type or shape_type_names.get(shape_type_val, "shape"),
            'shape_name': shape_name,
            'position': {
                'left': left,
                'top': top,
                'width': width,
                'height': height,
            },
        }
        if text:
            result['text'] = text
        if runs:
            result['runs'] = runs
        if fill_color:
            result['fill_color'] = fill_color
        if line_color:
            result['line_color'] = line_color
        if rotation:
            result['rotation'] = rotation
        if animation_order is not None:
            result['animation_order'] = animation_order

        return result

    except Exception as e:
        print(f"    Warning: Could not extract auto shape: {e}")
        return None


def extract_text_from_shape(shape):
    """Extract text content from a shape with formatting."""
    if not shape.has_text_frame:
        return None

    paragraphs = []
    for para in shape.text_frame.paragraphs:
        text = para.text.strip()
        if text:
            # Detect list items by bullet or level
            level = para.level if para.level else 0
            item = {
                'text': text,
                'level': level,
                'is_bullet': level > 0 or (para.font and para.font.bold is False)
            }
            # Extract formatted runs
            runs = extract_formatted_runs(para)
            if runs:
                item['runs'] = runs
            paragraphs.append(item)

    return paragraphs if paragraphs else None


def extract_emf_embedded_image(emf_data: bytes):
    """
    Extract embedded JPEG/PNG image from EMF+ (Enhanced Metafile Plus) format.

    EMF+ files often contain raster images embedded in GDIC comment records.
    This is common when screenshots are pasted into PowerPoint.

    Returns:
        Tuple of (image_bytes, extension) if found, None otherwise
    """
    import struct

    # EMF+ uses comment records (type 70) to store GDI+ data
    # Look for GDIC records which often contain embedded images
    pos = 0
    while pos < len(emf_data) - 8:
        try:
            record_type, record_size = struct.unpack('<II', emf_data[pos:pos+8])
        except struct.error:
            break

        if record_type == 70:  # EMR_COMMENT (may contain EMF+ or GDIC data)
            comment_data = emf_data[pos+8:pos+record_size]
            if len(comment_data) > 8:
                # Check for GDIC identifier (contains embedded images)
                identifier = comment_data[4:8]
                if identifier == b'GDIC':
                    # Search for JPEG signature (FFD8FF)
                    jpg_sig = b'\xff\xd8\xff'
                    jpg_pos = comment_data.find(jpg_sig)
                    if jpg_pos >= 0:
                        # Extract JPEG - find EOI marker (0xFFD9)
                        jpg_data = comment_data[jpg_pos:]
                        eoi_pos = jpg_data.find(b'\xff\xd9')
                        if eoi_pos > 0:
                            jpg_data = jpg_data[:eoi_pos+2]
                            return (jpg_data, 'jpg')

                    # Search for PNG signature
                    png_sig = b'\x89PNG\r\n\x1a\n'
                    png_pos = comment_data.find(png_sig)
                    if png_pos >= 0:
                        # Extract PNG - find IEND chunk
                        png_data = comment_data[png_pos:]
                        iend_pos = png_data.find(b'IEND')
                        if iend_pos > 0:
                            png_data = png_data[:iend_pos+8]  # Include IEND + CRC
                            return (png_data, 'png')

        if record_type == 14 or record_size == 0:  # EOF or invalid
            break
        pos += record_size

    return None


def extract_image(shape, media_dir, slide_num, shape_idx, slide_title=None):
    """Extract image from shape and save to media directory."""
    try:
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            image = shape.image
            ext = image.ext
            blob = image.blob
            content_type = getattr(image, 'content_type', '')

            # Handle EMF/WMF vector formats - try to extract embedded images or convert
            if ext in ('emf', 'wmf') or content_type in ('image/x-emf', 'image/x-wmf'):
                converted = False
                # First try to extract embedded images from EMF+ format
                try:
                    embedded = extract_emf_embedded_image(blob)
                    if embedded:
                        blob, ext = embedded
                        converted = True
                        print(f"    Extracted embedded image from EMF+ format")
                except Exception as emf_err:
                    pass  # Silent fail, try Pillow next

                # Fallback to Pillow conversion
                if not converted:
                    try:
                        from PIL import Image
                        import io
                        img = Image.open(io.BytesIO(blob))
                        png_buffer = io.BytesIO()
                        img.save(png_buffer, format='PNG')
                        blob = png_buffer.getvalue()
                        ext = 'png'
                        print(f"    Converted {content_type or 'EMF/WMF'} to PNG")
                    except Exception as conv_err:
                        print(f"    Warning: Could not convert {ext} to PNG: {conv_err}")

            filename = f"slide_{slide_num}_{shape_idx}.{ext}"
            filepath = media_dir / filename

            with open(filepath, 'wb') as f:
                f.write(blob)

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

    # Extract animation map for this slide
    animation_map = extract_animation_map(slide)

    # Sort shapes by position (top, left) for consistent ordering
    shapes = list(slide.shapes)
    shapes.sort(key=lambda s: (
        s.top if (hasattr(s, 'top') and s.top is not None) else 0,
        s.left if (hasattr(s, 'left') and s.left is not None) else 0
    ))

    # Process shapes
    for idx, shape in enumerate(shapes):
        # Title
        if shape.is_placeholder:
            placeholder_type = shape.placeholder_format.type
            if placeholder_type in [1, 3]:  # Title or Center Title
                if shape.has_text_frame:
                    title = shape.text_frame.text.strip()
                    # Clean up special characters
                    title = title.replace('\x0b', ' ').strip()
                continue

        # Images
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            img_content = extract_image(shape, media_dir, slide_num, idx, title)
            if img_content:
                content.append(img_content)
            continue

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
            continue

        # Auto shapes (arrows, connectors, symbols)
        shape_block = extract_auto_shape(shape, animation_map)
        if shape_block:
            content.append(shape_block)
            # If shape has text, also process as text (don't skip)
            if shape.has_text_frame and shape.text_frame.text.strip():
                text_content = extract_text_from_shape(shape)
                if text_content:
                    items = []
                    for p in text_content:
                        item = {'text': p['text'], 'children': []}
                        if 'runs' in p:
                            item['runs'] = p['runs']
                        items.append(item)
                    if items:
                        content.append({
                            'type': 'list',
                            'style': 'bullet',
                            'items': items
                        })
            continue

        # Text content
        text_content = extract_text_from_shape(shape)
        if text_content:
            # Check if it's a list or heading
            if len(text_content) == 1 and text_content[0]['level'] == 0:
                # Single paragraph - could be heading
                heading = {
                    'type': 'heading',
                    'text': text_content[0]['text'],
                    'level': 2
                }
                if 'runs' in text_content[0]:
                    heading['runs'] = text_content[0]['runs']
                content.append(heading)
            else:
                # Multiple items - treat as list
                items = []
                for p in text_content:
                    item = {'text': p['text'], 'children': []}
                    if 'runs' in p:
                        item['runs'] = p['runs']
                    items.append(item)
                if items:
                    content.append({
                        'type': 'list',
                        'style': 'bullet',
                        'items': items
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
