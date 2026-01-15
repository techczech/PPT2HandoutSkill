#!/usr/bin/env python3
"""
Categorize images in presentation.json based on their existing descriptions.
Does not require API calls - uses keyword matching on descriptions.
"""

import sys
import json
from pathlib import Path
import re

# Category detection patterns (case-insensitive)
CATEGORY_PATTERNS = {
    'tweet': [
        r'\btweet\b', r'\btwitter\b', r'\b@\w+\b', r'\bx\.com\b',
        r'posted on twitter', r'twitter post', r'tweeted', r'\bsama\b'
    ],
    'chat_screenshot': [
        r'\bslack\b', r'\bdiscord\b', r'\bteams\b', r'\bchat\b.*message',
        r'message from', r'\bconversation\b', r'chat interface'
    ],
    'interface_screenshot': [
        r'\bui\b', r'\binterface\b', r'\bdashboard\b', r'\bapp\b',
        r'screenshot', r'\bwebsite\b', r'\bpage\b', r'\bbrowser\b',
        r'google ai studio', r'\bnotebook\b', r'landing page',
        r'chatgpt', r'gemini', r'\bgpt\b', r'pricing', r'configuration'
    ],
    'chart': [
        r'\bchart\b', r'\bgraph\b', r'\bbar chart\b', r'\bline chart\b',
        r'\bvisualization\b', r'\bdata\b.*showing', r'\bstatistics\b',
        r'comparison', r'\btrend\b', r'\bbenchmark\b', r'\bleaderboard\b'
    ],
    'diagram': [
        r'\bdiagram\b', r'\bflowchart\b', r'\barchitecture\b', r'\binfographic\b',
        r'\bprocess\b.*flow', r'\bworkflow\b', r'\bschema\b', r'mind map'
    ],
    'photo_person': [
        r'\bphoto\b.*of', r'\bphotograph\b', r'\bportrait\b', r'\bheadshot\b',
        r'on stage', r'presenting at', r'\bspeaker\b', r'person shown'
    ],
    'book_cover': [
        r'\bbook\b.*cover', r'\bbook\b.*titled', r"book\s+'", r'book\s+"',
        r'\bcover\b.*book', r'learner.*apprentice'
    ],
    'academic_paper': [
        r'\bpaper\b', r'\bresearch\b.*paper', r'\bacademic\b', r'\barxiv\b',
        r'\bjournal\b', r'\babstract\b', r'\bcitation\b', r'\bauthors?\b.*et al',
        r'proceedings', r'excerpt', r'published'
    ],
    'cartoon': [
        r'\bcartoon\b', r'\billustration\b', r'\bcomic\b', r'\bmeme\b',
        r'\bdrawing\b', r'\banimated\b', r'depicts.*robot', r'stylized'
    ],
    'quote': [
        r'^quote:', r'\bblockquote\b', r'text-based quote'
    ]
}


def categorize_description(description: str) -> str:
    """Determine category based on description keywords."""
    if not description:
        return 'other'

    desc_lower = description.lower()

    # Check each category's patterns
    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, desc_lower):
                return category

    return 'other'


def main():
    if len(sys.argv) < 2:
        print("Usage: python categorize-presentation-images.py <site_directory>")
        sys.exit(1)

    site_dir = Path(sys.argv[1])
    json_path = site_dir / "src" / "data" / "presentation.json"

    if not json_path.exists():
        print(f"Error: presentation.json not found at {json_path}")
        sys.exit(1)

    # Load presentation
    print(f"Loading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data.get('sections', []))} sections")

    # Categorize images
    categorized = 0
    skipped = 0
    category_counts = {}

    for section in data['sections']:
        for slide in section['slides']:
            for content in slide.get('content', []):
                if content.get('type') == 'image':
                    description = content.get('description', '')

                    # Skip if already has a category
                    if content.get('category'):
                        skipped += 1
                        category_counts[content['category']] = category_counts.get(content['category'], 0) + 1
                        continue

                    # Categorize based on description
                    category = categorize_description(description)
                    content['category'] = category
                    category_counts[category] = category_counts.get(category, 0) + 1
                    categorized += 1

                    src = content.get('src', 'unknown')
                    print(f"  [{category}] {src}")

    # Save updated presentation
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 50)
    print("CATEGORIZATION COMPLETE")
    print("=" * 50)
    print(f"Images categorized: {categorized}")
    print(f"Images skipped (already categorized): {skipped}")
    print()
    print("Category breakdown:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    print()
    print(f"Updated: {json_path}")


if __name__ == "__main__":
    main()
