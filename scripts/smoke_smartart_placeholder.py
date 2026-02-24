#!/usr/bin/env python3
"""Smoke test SmartArt extraction from PlaceholderGraphicFrame slides."""

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


DEFAULT_PPTX = Path("/Users/dominiklukes/Downloads/Love Research Data IPad Slides.pptx")
REPO_ROOT = Path(__file__).resolve().parents[1]
EXTRACT_SCRIPT = REPO_ROOT / "scripts" / "extract-pptx.py"


def _flatten_slides(presentation_dict):
    slides = []
    for section in presentation_dict.get("sections", []):
        slides.extend(section.get("slides", []))
    return slides


def _collect_node_texts(nodes):
    texts = []
    for node in nodes:
        text = node.get("text")
        if text:
            texts.append(text)
        texts.extend(_collect_node_texts(node.get("children", [])))
    return texts


def _collect_node_icons(nodes):
    icons = []
    for node in nodes:
        icon = node.get("icon")
        if icon:
            icons.append(icon)
        icons.extend(_collect_node_icons(node.get("children", [])))
    return icons


def _collect_smartart_text(slide_dict):
    texts = []
    smartart_count = 0
    for block in slide_dict.get("content", []):
        if block.get("type") != "smart_art":
            continue
        smartart_count += 1
        texts.extend(_collect_node_texts(block.get("nodes", [])))
    return smartart_count, " ".join(texts)


def _assert_slide8_icons(slide_dict):
    smartart_blocks = [b for b in slide_dict.get("content", []) if b.get("type") == "smart_art"]
    if len(smartart_blocks) < 2:
        raise AssertionError("Slide 8 should contain at least two smart_art blocks")

    icons = []
    for block in smartart_blocks:
        icons.extend(_collect_node_icons(block.get("nodes", [])))

    if len(icons) < 6:
        raise AssertionError(f"Slide 8 expected at least 6 SmartArt icons, got {len(icons)}")
    if len(set(icons)) < 6:
        raise AssertionError("Slide 8 SmartArt icons are not unique (collision/overwrite detected)")


def _assert_keywords(slide_order, text, keywords):
    text_l = text.lower()
    missing = [kw for kw in keywords if kw.lower() not in text_l]
    if missing:
        raise AssertionError(f"Slide {slide_order} missing SmartArt keywords: {missing}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pptx", type=Path, default=DEFAULT_PPTX, help="Path to PPTX file")
    args = parser.parse_args()

    if not args.pptx.exists():
        print(f"PPTX not found: {args.pptx}", file=sys.stderr)
        return 2

    tmp_dir = Path(tempfile.mkdtemp(prefix="smoke_ppt2handout_"))
    try:
        cmd = [sys.executable, str(EXTRACT_SCRIPT), str(args.pptx), str(tmp_dir)]
        result = subprocess.run(cmd, cwd=REPO_ROOT, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stdout, end="")
            print(result.stderr, end="", file=sys.stderr)
            raise AssertionError("PPT2Handout extraction failed")

        presentation_path = tmp_dir / "presentation.json"
        if not presentation_path.exists():
            raise AssertionError(f"Missing output file: {presentation_path}")

        with open(presentation_path, "r", encoding="utf-8") as f:
            presentation_dict = json.load(f)

        slides = {slide["order"]: slide for slide in _flatten_slides(presentation_dict)}
        for required in (3, 4, 8):
            if required not in slides:
                raise AssertionError(f"Slide {required} not found in extracted output")

        slide3_count, slide3_text = _collect_smartart_text(slides[3])
        slide4_count, slide4_text = _collect_smartart_text(slides[4])

        if slide3_count < 1:
            raise AssertionError("Slide 3 has no smart_art block")
        if slide4_count < 1:
            raise AssertionError("Slide 4 has no smart_art block")

        _assert_keywords(3, slide3_text, ["Supported", "ChatGPT", "Gemini", "NotebookLM", "Copilot"])
        _assert_keywords(4, slide4_text, ["Jargon-free sessions", "In Person", "Online", "Custom"])
        _assert_slide8_icons(slides[8])
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    print("PASS: PPT2HandoutSkill extracted SmartArt text and unique SmartArt icons (slides 3, 4, 8).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
