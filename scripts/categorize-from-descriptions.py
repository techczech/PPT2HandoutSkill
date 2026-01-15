#!/usr/bin/env python3
"""
Categorize images in entities.json based on their existing descriptions.
Does not require API calls - uses keyword matching on descriptions.
"""

import sys
import json
from pathlib import Path
import re

# Category detection patterns (case-insensitive)
CATEGORY_PATTERNS = {
    'tweet': [
        r'\btweet\b', r'\btwitter\b', r'\b@\w+\b.*tweet', r'\bx\.com\b',
        r'posted on twitter', r'twitter post', r'tweeted'
    ],
    'chat_screenshot': [
        r'\bslack\b', r'\bdiscord\b', r'\bteams\b', r'\bchat\b.*message',
        r'message from', r'\bconversation\b', r'chat interface'
    ],
    'interface_screenshot': [
        r'\bui\b', r'\binterface\b', r'\bdashboard\b', r'\bapp\b.*showing',
        r'screenshot of', r'\bwebsite\b', r'\bpage\b.*showing', r'\bbrowser\b',
        r'google ai studio', r'\bnotebook\b', r'hugging face', r'\bollama\b',
        r'chatgpt', r'\bgpt\b.*interface', r'pricing page', r'configuration',
        r'product page', r'\bapi\b.*page', r'landing page'
    ],
    'chart': [
        r'\bchart\b', r'\bgraph\b', r'\bbar chart\b', r'\bline chart\b',
        r'\bvisualization\b', r'\bdata\b.*showing', r'\bstatistics\b',
        r'comparison', r'\btrend\b', r'\bbenchmark\b', r'\bscore\b',
        r'\bperformance\b.*chart', r'\bleaderboard\b'
    ],
    'diagram': [
        r'\bdiagram\b', r'\bflowchart\b', r'\barchitecture\b', r'\bmodel\b.*showing',
        r'\bprocess\b.*flow', r'\bworkflow\b', r'\bschema\b'
    ],
    'photo_person': [
        r'\bphoto\b.*of', r'\bphotograph\b', r'\bportrait\b', r'\bheadshot\b',
        r'on stage', r'presenting', r'\bspeaker\b', r'person shown'
    ],
    'book_cover': [
        r'\bbook\b.*cover', r'\bbook\b.*titled', r"book\s+'", r'book\s+"',
        r'\bcover\b.*book', r'\bpublication\b'
    ],
    'academic_paper': [
        r'\bpaper\b', r'\bresearch\b.*paper', r'\bacademic\b', r'\barxiv\b',
        r'\bjournal\b', r'\babstract\b', r'\bcitation\b', r'\bauthors?\b.*et al',
        r'proceedings', r'\bconference\b.*paper'
    ],
    'product_page': [
        r'\bpricing\b', r'\bproduct\b.*page', r'\bbuy\b', r'\b£\d', r'\b\$\d',
        r'add to cart', r'\bstore\b', r'apple.*mac', r'purchase'
    ],
    'quote': [
        r'\bquote\b', r'\bsaying\b', r'said\b', r'\bstatement\b',
        r'quote from', r'\bblockquote\b'
    ],
    'cartoon': [
        r'\bcartoon\b', r'\billustration\b', r'\bcomic\b', r'\bmeme\b',
        r'\bdrawing\b', r'\banimated\b', r'\bmascot\b'
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
        print("Usage: python categorize-from-descriptions.py <site_directory>")
        print("Example: python categorize-from-descriptions.py /path/to/threeyearsafterchatgpt")
        sys.exit(1)

    site_dir = Path(sys.argv[1])
    entities_path = site_dir / "src" / "data" / "entities.json"

    if not entities_path.exists():
        print(f"Error: entities.json not found at {entities_path}")
        sys.exit(1)

    # Load entities
    print(f"Loading {entities_path}...")
    with open(entities_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    images = data.get('images', [])
    if not images:
        print("No images found in entities.json")
        sys.exit(0)

    print(f"Found {len(images)} images")

    # Categorize images
    categorized = 0
    category_counts = {}

    for img in images:
        description = img.get('description', '')

        # Skip if already has a category
        if img.get('category'):
            category_counts[img['category']] = category_counts.get(img['category'], 0) + 1
            continue

        # Categorize based on description
        category = categorize_description(description)
        img['category'] = category
        category_counts[category] = category_counts.get(category, 0) + 1
        categorized += 1

        print(f"  [{category}] {img.get('src', 'unknown')[:50]}...")

    # Save updated entities
    with open(entities_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 50)
    print("CATEGORIZATION COMPLETE")
    print("=" * 50)
    print(f"Images categorized: {categorized}")
    print()
    print("Category breakdown:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    print()
    print(f"Updated: {entities_path}")


if __name__ == "__main__":
    main()
