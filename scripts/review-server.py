#!/usr/bin/env python3
"""
Unified Web UI for reviewing AI image analysis and entity extraction results.
Launches a local server where users can:
1. Images tab: Select backend/model, analyze images, review and edit results
2. Entities tab: Review and edit extracted entities (people, tools, orgs, terms, quotes, dates)
"""

import sys
import json
import argparse
import webbrowser
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from typing import Optional, Any
import threading
import time

# Import analysis functions from the main script
sys.path.insert(0, str(Path(__file__).parent))

# We'll import these dynamically to avoid circular imports
analyze_module: Any = None

def get_analyze_module() -> Any:
    global analyze_module
    if analyze_module is None:
        spec_path = Path(__file__).parent / "analyze-existing-images.py"
        import importlib.util
        spec = importlib.util.spec_from_file_location("analyze_images", spec_path)
        if spec and spec.loader:
            analyze_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(analyze_module)
    return analyze_module


# Global state
class AppState:
    def __init__(self) -> None:
        self.site_dir: Optional[Path] = None
        self.presentation_data: dict = {}
        self.json_path: Optional[Path] = None
        self.entities_path: Optional[Path] = None
        self.entities_data: dict = {}
        self.public_dir: Optional[Path] = None
        self.pending_results: dict = {}
        self.custom_prompt: Optional[str] = None
        self.custom_entity_prompt: Optional[str] = None
        self.runtime_api_key: Optional[str] = None


state = AppState()

DEFAULT_ENTITY_PROMPT = """Extract structured entities from this presentation text. Return a JSON object with these arrays:

{{
  "people": [{{"name": "...", "role": "...", "mentions": [{{"slideIndex": N, "context": "..."}}]}}],
  "organizations": [{{"name": "...", "type": "...", "mentions": [{{"slideIndex": N, "context": "..."}}]}}],
  "tools": [{{"name": "...", "maker": "...", "type": "...", "mentions": [{{"slideIndex": N, "context": "..."}}]}}],
  "quotes": [{{"text": "...", "attribution": "...", "source": "...", "slideIndex": N, "topic": "..."}}],
  "terms": [{{"term": "...", "definition": "...", "slideIndex": N}}],
  "dates": [{{"date": "...", "event": "...", "significance": "...", "slideIndex": N}}],
  "activities": [{{"title": "...", "description": "...", "section": "...", "slideIndex": N}}],
  "links": [{{"url": "...", "label": "...", "linkType": "...", "slideIndex": N}}]
}}

Guidelines:
- Extract ALL attributed quotes, including from image transcripts
- Every person mentioned by name should be in people (authors, speakers, quoted individuals)
- Tools include software, AI models, platforms, services
- Terms are domain-specific vocabulary with definitions from context
- Dates include specific dates/years mentioned with their significance
- Activities are exercises, demos, or hands-on tasks described in the presentation
- Links are URLs found in the text
- Include slideIndex where identifiable from the text markers

{user_notes}

PRESENTATION TEXT:
{slide_text}

Return ONLY valid JSON, no other text."""

DEFAULT_PROMPT = """Analyze this presentation slide image{context}. Respond in JSON format:

{{
  "description": "Brief visual description of what the image shows — layout, colors, key visual elements (30-60 words). Do NOT include text content here.",
  "transcript": "Full verbatim transcription of ALL readable text in the image. Include headings, body text, captions, labels, watermarks. Preserve line breaks with \\n. If no readable text, use empty string.",
  "transcript_usage": "full | summary | none",
  "transcript_rationale": "Brief explanation of why you chose that transcript_usage level",
  "category": "one of: {categories}",
  "has_quote": true/false,
  "quote_text": "If image contains an attributed quote or notable statement, extract it verbatim here",
  "quote_attribution": "Who said it (name, @handle, title)"
}}

transcript_usage guidance:
- "full": The text IS the content (tweets, quotes, chat messages, article excerpts, code). Include full transcript.
- "summary": The text is supporting (UI labels, slide bullets, diagram labels). A summary suffices.
- "none": No meaningful text, or text is decorative/redundant with the description.

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

Return ONLY valid JSON, no other text."""


HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review UI</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f7;
            color: #1d1d1f;
            min-height: 100vh;
        }
        .header {
            background: #fff;
            padding: 0.75rem 2rem;
            border-bottom: 1px solid #d2d2d7;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.75rem;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header h1 { font-size: 1.3rem; color: #1d1d1f; font-weight: 600; }
        .controls {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }
        select, button, input[type="text"] {
            padding: 0.4rem 0.75rem;
            border-radius: 6px;
            border: 1px solid #d2d2d7;
            background: #fff;
            color: #1d1d1f;
            font-size: 0.85rem;
            cursor: pointer;
        }
        select:hover, button:hover { border-color: #0071e3; }
        select:focus, button:focus, input:focus, textarea:focus {
            outline: none;
            border-color: #0071e3;
            box-shadow: 0 0 0 3px rgba(0,113,227,0.15);
        }
        button.primary {
            background: #0071e3;
            border-color: #0071e3;
            color: #fff;
            font-weight: 600;
        }
        button.primary:hover { background: #0077ed; }
        button.success { background: #34c759; border-color: #34c759; color: #fff; }
        button.success:hover { background: #2db84d; }
        button.danger { background: #ff3b30; border-color: #ff3b30; color: #fff; }
        button.danger:hover { background: #e6352b; }
        button.secondary { background: #e8e8ed; border-color: #d2d2d7; color: #1d1d1f; }
        button.secondary:hover { background: #d2d2d7; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        .stats {
            padding: 0.4rem 1rem;
            background: #fff;
            border-bottom: 1px solid #d2d2d7;
            font-size: 0.8rem;
            color: #86868b;
        }
        .main { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .main-tabs {
            display: flex;
            gap: 0;
            margin-bottom: 1.5rem;
            background: #e8e8ed;
            border-radius: 8px;
            padding: 3px;
            width: fit-content;
        }
        .main-tab {
            padding: 0.5rem 1.25rem;
            background: transparent;
            border: none;
            color: #86868b;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            border-radius: 6px;
            transition: all 0.15s;
        }
        .main-tab.active { color: #1d1d1f; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .main-tab:hover:not(.active) { color: #1d1d1f; }
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }
        .sub-tabs {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 1.25rem;
            flex-wrap: wrap;
        }
        .sub-tab {
            padding: 0.35rem 0.75rem;
            background: #fff;
            border: 1px solid #d2d2d7;
            color: #86868b;
            cursor: pointer;
            font-size: 0.8rem;
            border-radius: 6px;
            font-weight: 500;
        }
        .sub-tab.active { color: #0071e3; border-color: #0071e3; background: #f0f7ff; }
        .sub-tab:hover:not(.active) { color: #1d1d1f; border-color: #86868b; }

        /* Image grid */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 1rem;
        }
        .card {
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #d2d2d7;
            transition: box-shadow 0.2s;
        }
        .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .card.selected { border-color: #34c759; border-width: 2px; }
        .card.analyzed { border-color: #ff9500; }
        .card.approved { border-color: #34c759; }
        .card-image {
            width: 100%;
            height: 180px;
            object-fit: contain;
            background: #f5f5f7;
            cursor: pointer;
        }
        .card-body { padding: 0.75rem; }
        .card-title {
            font-size: 0.75rem;
            color: #86868b;
            margin-bottom: 0.3rem;
            word-break: break-all;
            font-family: 'SF Mono', SFMono-Regular, monospace;
        }
        .card-slide {
            font-size: 0.75rem;
            color: #0071e3;
            margin-bottom: 0.5rem;
        }
        .card-status {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            margin-bottom: 0.5rem;
        }
        .status-pending { background: #f5f5f7; color: #86868b; }
        .status-analyzing { background: #fff3e0; color: #ff9500; }
        .status-analyzed { background: #e3f2fd; color: #0071e3; }
        .status-approved { background: #e8f5e9; color: #34c759; }
        .status-existing { background: #f3e5f5; color: #af52de; }

        /* Result display — the key UX improvement */
        .result-display {
            background: #f5f5f7;
            border-radius: 8px;
            margin-top: 0.5rem;
            overflow: hidden;
        }
        .result-section {
            padding: 0.6rem 0.75rem;
            border-bottom: 1px solid #e8e8ed;
        }
        .result-section:last-child { border-bottom: none; }
        .result-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #86868b;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .result-label .badge {
            font-size: 0.65rem;
            padding: 0.1rem 0.35rem;
            border-radius: 3px;
            font-weight: 500;
            text-transform: none;
            letter-spacing: 0;
        }
        .badge-full { background: #e8f5e9; color: #2e7d32; }
        .badge-summary { background: #fff3e0; color: #e65100; }
        .badge-none { background: #f5f5f7; color: #86868b; }
        .result-text {
            font-size: 0.85rem;
            color: #1d1d1f;
            line-height: 1.45;
        }
        .result-text.transcript {
            font-family: 'SF Mono', SFMono-Regular, monospace;
            font-size: 0.78rem;
            white-space: pre-wrap;
            max-height: 120px;
            overflow-y: auto;
            color: #3a3a3c;
        }
        .result-text.quote-text {
            font-style: italic;
            border-left: 3px solid #0071e3;
            padding-left: 0.6rem;
        }
        .result-category {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            background: #e8e8ed;
            border-radius: 4px;
            font-size: 0.78rem;
            font-weight: 500;
        }

        /* Editable result */
        .result-edit textarea {
            width: 100%;
            background: #fff;
            border: 1px solid #d2d2d7;
            color: #1d1d1f;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.82rem;
            resize: vertical;
            font-family: inherit;
            line-height: 1.4;
        }
        .result-edit textarea.mono {
            font-family: 'SF Mono', SFMono-Regular, monospace;
            font-size: 0.78rem;
        }
        .result-edit select {
            width: 100%;
            margin-top: 0.25rem;
            padding: 0.35rem;
            font-size: 0.82rem;
        }
        .result-edit input[type="text"] {
            width: 100%;
            padding: 0.35rem 0.5rem;
            font-size: 0.82rem;
        }
        .result-edit label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #86868b;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            display: block;
            margin-top: 0.5rem;
            margin-bottom: 0.2rem;
        }
        .result-edit label:first-child { margin-top: 0; }

        .card-actions {
            display: flex;
            gap: 0.4rem;
            margin-top: 0.5rem;
        }
        .card-actions button {
            flex: 1;
            padding: 0.35rem;
            font-size: 0.78rem;
        }
        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .checkbox-wrapper input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: #0071e3;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        .modal.active { display: flex; }
        .modal img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        }
        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 2rem;
            color: #fff;
            cursor: pointer;
            background: none;
            border: none;
        }
        .loading {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid #fff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.4rem;
            vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .toast {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            padding: 0.75rem 1.25rem;
            background: #1d1d1f;
            color: #fff;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.85rem;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.25s;
            z-index: 1001;
        }
        .toast.show { opacity: 1; transform: translateY(0); }
        .toast.error { background: #ff3b30; }
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #86868b;
        }
        .empty-state h2 { margin-bottom: 0.5rem; font-weight: 500; }
        .category-summary {
            display: flex;
            gap: 0.4rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        .category-badge {
            background: #fff;
            border: 1px solid #d2d2d7;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        .category-badge .cat-count {
            color: #0071e3;
            font-weight: 600;
        }

        /* Prompt editor */
        .prompt-editor {
            background: #fff;
            border: 1px solid #d2d2d7;
            border-radius: 10px;
            margin-bottom: 1.25rem;
            overflow: hidden;
        }
        .prompt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0.75rem;
            background: #f5f5f7;
            border-bottom: 1px solid #d2d2d7;
            cursor: pointer;
            user-select: none;
        }
        .prompt-header h3 {
            font-size: 0.8rem;
            font-weight: 600;
            color: #86868b;
        }
        .prompt-header .toggle { font-size: 0.7rem; color: #86868b; }
        .prompt-body {
            display: none;
            padding: 0.75rem;
        }
        .prompt-body.open { display: block; }
        .prompt-body textarea {
            width: 100%;
            min-height: 200px;
            background: #f5f5f7;
            border: 1px solid #d2d2d7;
            color: #1d1d1f;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-family: 'SF Mono', SFMono-Regular, monospace;
            resize: vertical;
            line-height: 1.5;
        }
        .prompt-body .prompt-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
            justify-content: flex-end;
        }

        /* Entity styles */
        .entity-section { margin-bottom: 2rem; }
        .entity-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        .entity-section-header h3 { font-size: 1rem; font-weight: 600; }
        .entity-section-header .count { color: #86868b; font-size: 0.85rem; }
        .entity-card {
            background: #fff;
            border: 1px solid #d2d2d7;
            border-radius: 8px;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            transition: box-shadow 0.2s;
        }
        .entity-card:hover { box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .entity-card.editing { border-color: #ff9500; }
        .entity-field { margin-bottom: 0.4rem; }
        .entity-field label {
            color: #86868b;
            font-weight: 600;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            display: block;
            margin-bottom: 0.15rem;
        }
        .entity-field .value { color: #1d1d1f; font-size: 0.85rem; }
        .entity-field input, .entity-field textarea, .entity-field select {
            width: 100%;
            background: #f5f5f7;
            border: 1px solid #d2d2d7;
            color: #1d1d1f;
            padding: 0.4rem 0.5rem;
            border-radius: 6px;
            font-size: 0.82rem;
            font-family: inherit;
        }
        .entity-field textarea { resize: vertical; min-height: 50px; }
        .entity-actions {
            display: flex;
            gap: 0.4rem;
            margin-top: 0.5rem;
        }
        .entity-actions button { padding: 0.3rem 0.6rem; font-size: 0.78rem; }
        .entity-mentions {
            font-size: 0.7rem;
            color: #86868b;
            margin-top: 0.25rem;
        }
        .entity-mentions span {
            background: #f5f5f7;
            padding: 0.1rem 0.35rem;
            border-radius: 3px;
            margin-right: 0.25rem;
            display: inline-block;
            margin-bottom: 0.15rem;
            border: 1px solid #e8e8ed;
        }
        .entity-controls {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Review UI</h1>
        <div class="controls" id="imageControls">
            <select id="backendSelect">
                <option value="">Loading backends...</option>
            </select>
            <select id="modelSelect">
                <option value="">Select model...</option>
            </select>
            <button onclick="analyzeSelected()" id="analyzeBtn" disabled>
                Analyze Selected
            </button>
            <button onclick="approveAll()" class="success" id="approveAllBtn" disabled>
                Approve All
            </button>
            <button onclick="saveApproved()" class="primary" id="saveBtn" disabled>
                Save to presentation.json
            </button>
        </div>
        <div class="controls" id="entityControls" style="display:none;">
            <select id="entityBackendSelect">
                <option value="">Select backend...</option>
            </select>
            <select id="entityModelSelect">
                <option value="">Select model...</option>
            </select>
            <input type="password" id="apiKeyInput" placeholder="Gemini API key"
                   style="width:180px;display:none;" onchange="setApiKey(this.value)">
            <button onclick="extractEntities()" class="primary" id="extractEntitiesBtn" disabled>
                Re-extract Entities
            </button>
            <button onclick="autoPopulateEntities()" class="secondary" id="autoPopBtn">
                Auto-populate from Images
            </button>
            <button onclick="saveEntities()" class="primary" id="saveEntitiesBtn">
                Save entities.json
            </button>
        </div>
    </div>
    <div class="stats" id="stats">Loading...</div>
    <div class="main">
        <div class="main-tabs">
            <button class="main-tab active" data-maintab="images" onclick="switchMainTab('images')">Images</button>
            <button class="main-tab" data-maintab="entities" onclick="switchMainTab('entities')">Entities</button>
        </div>

        <!-- Images Tab Panel -->
        <div class="tab-panel active" id="imagesPanel">
            <div class="prompt-editor">
                <div class="prompt-header" onclick="togglePrompt()">
                    <h3>Analysis Prompt</h3>
                    <span class="toggle" id="promptToggle">Show ▼</span>
                </div>
                <div class="prompt-body" id="promptBody">
                    <textarea id="promptText"></textarea>
                    <div class="prompt-actions">
                        <button onclick="resetPrompt()" class="secondary">Reset to Default</button>
                        <button onclick="savePrompt()" class="primary">Save Prompt</button>
                    </div>
                </div>
            </div>
            <div class="category-summary" id="categorySummary"></div>
            <div class="sub-tabs">
                <button onclick="toggleSelectAll()" class="secondary" id="selectAllBtn" style="margin-right:0.5rem;">Select All</button>
                <button class="sub-tab active" data-tab="pending" onclick="switchTab('pending')">
                    Pending <span id="pendingCount">(0)</span>
                </button>
                <button class="sub-tab" data-tab="analyzed" onclick="switchTab('analyzed')">
                    Analyzed <span id="analyzedCount">(0)</span>
                </button>
                <button class="sub-tab" data-tab="approved" onclick="switchTab('approved')">
                    Approved <span id="approvedCount">(0)</span>
                </button>
                <button class="sub-tab" data-tab="existing" onclick="switchTab('existing')">
                    Done <span id="existingCount">(0)</span>
                </button>
            </div>
            <div class="grid" id="imageGrid"></div>
        </div>

        <!-- Entities Tab Panel -->
        <div class="tab-panel" id="entitiesPanel">
            <div class="entity-controls">
                <button class="sub-tab active" data-entitytab="people" onclick="switchEntityTab('people')">People</button>
                <button class="sub-tab" data-entitytab="quotes" onclick="switchEntityTab('quotes')">Quotes</button>
                <button class="sub-tab" data-entitytab="tools" onclick="switchEntityTab('tools')">Tools</button>
                <button class="sub-tab" data-entitytab="organizations" onclick="switchEntityTab('organizations')">Organizations</button>
                <button class="sub-tab" data-entitytab="terms" onclick="switchEntityTab('terms')">Terms</button>
                <button class="sub-tab" data-entitytab="dates" onclick="switchEntityTab('dates')">Dates</button>
                <button class="sub-tab" data-entitytab="activities" onclick="switchEntityTab('activities')">Activities</button>
                <button class="sub-tab" data-entitytab="links" onclick="switchEntityTab('links')">Links</button>
            </div>
            <div class="prompt-editor">
                <div class="prompt-header" onclick="toggleEntityPrompt()">
                    <h3>Entity Extraction Prompt</h3>
                    <span class="toggle" id="entityPromptToggle">Show ▼</span>
                </div>
                <div class="prompt-body" id="entityPromptBody">
                    <textarea id="entityPromptText" rows="12"></textarea>
                    <div style="margin-top:0.5rem;font-size:0.75rem;color:#86868b;">
                        Use <code>{slide_text}</code> for the full presentation text and <code>{user_notes}</code> for your additional notes/examples.
                    </div>
                    <label for="entityUserNotes" style="font-size:0.7rem;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.04em;display:block;margin-top:0.5rem;">User Notes / Examples</label>
                    <textarea id="entityUserNotes" rows="4" placeholder="Add context, corrections, or examples to guide extraction..."></textarea>
                    <div class="prompt-actions">
                        <button onclick="resetEntityPrompt()" class="secondary">Reset to Default</button>
                        <button onclick="saveEntityPrompt()" class="primary">Save Prompt</button>
                    </div>
                </div>
            </div>
            <div id="entityContent"></div>
        </div>
    </div>
    <div class="modal" id="imageModal" onclick="closeModal()">
        <button class="modal-close">&times;</button>
        <img id="modalImage" src="" alt="">
    </div>
    <div class="toast" id="toast"></div>

    <script>
        const CATEGORIES = [
            'cartoon', 'interface_screenshot', 'chat_screenshot', 'tweet',
            'quote', 'academic_paper', 'diagram', 'chart', 'photo_person',
            'book_cover', 'product_page', 'other'
        ];

        let backends = {};
        let images = [];
        let entities = {};
        let currentTab = 'pending';
        let currentMainTab = 'images';
        let currentEntityTab = 'people';
        let selectedBackend = '';
        let selectedModel = '';
        let editingEntity = null;
        let defaultPrompt = '';
        let currentPrompt = '';
        let defaultEntityPrompt = '';
        let currentEntityPrompt = '';
        let apiKey = '';

        async function init() {
            await Promise.all([loadBackends(), loadImages(), loadEntities(), loadPrompt(), loadEntityPrompt()]);
            updateStats();
            renderImages();
            updateCategorySummary();
        }

        // === API Key ===
        async function setApiKey(key) {
            apiKey = key;
            try {
                await fetch('/api/apikey', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({key})
                });
                // Reload backends since Gemini may now be available
                await loadBackends();
                showToast(key ? 'API key set — backends refreshed' : 'API key cleared');
            } catch(e) {}
        }

        // === Prompt Editor ===
        async function loadPrompt() {
            try {
                const res = await fetch('/api/prompt');
                const data = await res.json();
                defaultPrompt = data.default_prompt;
                currentPrompt = data.current_prompt;
                document.getElementById('promptText').value = currentPrompt;
            } catch(e) {}
        }

        function togglePrompt() {
            const body = document.getElementById('promptBody');
            const toggle = document.getElementById('promptToggle');
            if (body.classList.contains('open')) {
                body.classList.remove('open');
                toggle.textContent = 'Show ▼';
            } else {
                body.classList.add('open');
                toggle.textContent = 'Hide ▲';
            }
        }

        function resetPrompt() {
            document.getElementById('promptText').value = defaultPrompt;
            currentPrompt = defaultPrompt;
            savePrompt();
        }

        async function savePrompt() {
            currentPrompt = document.getElementById('promptText').value;
            try {
                await fetch('/api/prompt', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({prompt: currentPrompt})
                });
                showToast('Prompt saved');
            } catch(e) {
                showToast('Failed to save prompt', true);
            }
        }

        // === Main Tab Switching ===
        function switchMainTab(tab) {
            currentMainTab = tab;
            document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-maintab="${tab}"]`).classList.add('active');
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(tab + 'Panel').classList.add('active');
            document.getElementById('imageControls').style.display = tab === 'images' ? 'flex' : 'none';
            document.getElementById('entityControls').style.display = tab === 'entities' ? 'flex' : 'none';
            if (tab === 'entities') {
                renderEntities();
                populateEntityBackends();
            }
            if (tab === 'images') { updateStats(); updateCategorySummary(); }
        }

        let textBackends = {};

        async function loadTextBackends() {
            try {
                const res = await fetch('/api/text-backends');
                textBackends = await res.json();
            } catch(e) { textBackends = {}; }
        }

        async function populateEntityBackends() {
            await loadTextBackends();
            const sel = document.getElementById('entityBackendSelect');
            sel.innerHTML = '<option value="">Select backend...</option>';
            for (const [name, info] of Object.entries(textBackends)) {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name + ' (' + info.models.length + ' models)';
                sel.appendChild(opt);
            }
        }

        document.getElementById('entityBackendSelect').addEventListener('change', (e) => {
            const backend = e.target.value;
            const modelSel = document.getElementById('entityModelSelect');
            const apiKeyEl = document.getElementById('apiKeyInput');
            modelSel.innerHTML = '<option value="">Select model...</option>';

            // Show API key input only for gemini
            apiKeyEl.style.display = backend === 'gemini' ? '' : 'none';

            if (backend && textBackends[backend]) {
                for (const model of textBackends[backend].models) {
                    const opt = document.createElement('option');
                    opt.value = model.id;
                    opt.textContent = model.name;
                    modelSel.appendChild(opt);
                }
            }
            updateEntityButtons();
        });

        document.getElementById('entityModelSelect').addEventListener('change', () => updateEntityButtons());

        function updateEntityButtons() {
            const hasBackend = document.getElementById('entityBackendSelect').value;
            const hasModel = document.getElementById('entityModelSelect').value;
            document.getElementById('extractEntitiesBtn').disabled = !hasBackend || !hasModel;
        }

        // === Image Review ===
        async function loadBackends() {
            try {
                const res = await fetch('/api/backends');
                backends = await res.json();
                const select = document.getElementById('backendSelect');
                select.innerHTML = '<option value="">Select backend...</option>';
                for (const [name, info] of Object.entries(backends)) {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name + ' (' + info.models.length + ' models)';
                    select.appendChild(opt);
                }
            } catch (e) {
                document.getElementById('backendSelect').innerHTML = '<option value="">No backends</option>';
            }
        }

        document.getElementById('backendSelect').addEventListener('change', (e) => {
            selectedBackend = e.target.value;
            const modelSelect = document.getElementById('modelSelect');
            modelSelect.innerHTML = '<option value="">Select model...</option>';
            if (selectedBackend && backends[selectedBackend]) {
                for (const model of backends[selectedBackend].models) {
                    const opt = document.createElement('option');
                    opt.value = model.id;
                    opt.textContent = model.name;
                    modelSelect.appendChild(opt);
                }
            }
            updateButtons();
        });

        document.getElementById('modelSelect').addEventListener('change', (e) => {
            selectedModel = e.target.value;
            updateButtons();
        });

        async function loadImages() {
            try {
                const res = await fetch('/api/images');
                images = await res.json();
            } catch (e) { showToast('Failed to load images', true); }
        }

        function updateCategorySummary() {
            const cats = {};
            images.forEach(img => {
                if (img.result && img.result.category) {
                    cats[img.result.category] = (cats[img.result.category] || 0) + 1;
                }
            });
            const el = document.getElementById('categorySummary');
            if (Object.keys(cats).length === 0) { el.innerHTML = ''; return; }
            el.innerHTML = Object.entries(cats)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => `<span class="category-badge">${cat}: <span class="cat-count">${count}</span></span>`)
                .join('');
        }

        function updateStats() {
            const pending = images.filter(i => i.status === 'pending').length;
            const analyzed = images.filter(i => i.status === 'analyzed').length;
            const approved = images.filter(i => i.status === 'approved').length;
            const existing = images.filter(i => i.status === 'existing').length;
            document.getElementById('stats').textContent =
                `${images.length} images: ${pending} pending, ${analyzed} analyzed, ${approved} approved, ${existing} done`;
            document.getElementById('pendingCount').textContent = `(${pending})`;
            document.getElementById('analyzedCount').textContent = `(${analyzed})`;
            document.getElementById('approvedCount').textContent = `(${approved})`;
            document.getElementById('existingCount').textContent = `(${existing})`;
            updateButtons();
        }

        function updateButtons() {
            const hasSelection = images.some(i => i.selected && i.status === 'pending');
            const hasAnalyzed = images.some(i => i.status === 'analyzed');
            const hasApproved = images.some(i => i.status === 'approved');
            document.getElementById('analyzeBtn').disabled = !hasSelection || !selectedModel;
            document.getElementById('approveAllBtn').disabled = !hasAnalyzed;
            document.getElementById('saveBtn').disabled = !hasApproved;
        }

        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
            renderImages();
        }

        function renderImages() {
            const grid = document.getElementById('imageGrid');
            const filtered = images.filter(i => i.status === currentTab);
            if (filtered.length === 0) {
                grid.innerHTML = `<div class="empty-state"><h2>No images here</h2></div>`;
                return;
            }
            grid.innerHTML = filtered.map(img => `
                <div class="card ${img.selected ? 'selected' : ''} ${img.status}">
                    <img class="card-image" src="/image/${encodeURIComponent(img.src)}"
                         alt="${esc(img.src)}" onclick="openModal('/image/${encodeURIComponent(img.src)}')">
                    <div class="card-body">
                        <div class="card-title">${esc(img.src)}</div>
                        <div class="card-slide">${esc(img.slideTitle || 'Unknown slide')}</div>
                        <span class="card-status status-${img.status}">${img.status}</span>
                        ${img.status === 'pending' ? `
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="sel-${img.id}" ${img.selected ? 'checked' : ''}
                                       onchange="toggleSelect('${img.id}')">
                                <label for="sel-${img.id}">Select for analysis</label>
                            </div>
                        ` : ''}
                        ${img.result ? renderResult(img) : ''}
                        ${img.status === 'analyzed' ? `
                            <div class="card-actions">
                                <button onclick="approveImage('${img.id}')" class="success">Approve</button>
                                <button onclick="markIncorrect('${img.id}')" class="danger">Reset</button>
                            </div>
                        ` : ''}
                        ${img.status === 'approved' ? `
                            <div class="card-actions">
                                <button onclick="unapproveImage('${img.id}')" class="secondary">Edit</button>
                            </div>
                        ` : ''}
                        ${img.status === 'existing' ? `
                            <div class="card-actions">
                                <button onclick="markIncorrect('${img.id}')" class="danger">Reset</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        function renderResult(img) {
            const r = img.result;
            if (img.status === 'analyzed') {
                // Editable form
                const usageBadge = r.transcript_usage === 'full' ? 'badge-full' :
                                   r.transcript_usage === 'summary' ? 'badge-summary' : 'badge-none';
                return `<div class="result-edit">
                    <label>Description</label>
                    <textarea id="desc-${img.id}" rows="2">${esc(r.description || '')}</textarea>

                    <label>Transcript ${r.transcript_usage ? `<span class="badge ${usageBadge}" style="margin-left:0.3rem;">${r.transcript_usage}</span>` : ''}</label>
                    <textarea id="transcript-${img.id}" rows="3" class="mono">${esc(r.transcript || '')}</textarea>

                    <label>Transcript Usage</label>
                    <select id="tusage-${img.id}">
                        <option value="full" ${r.transcript_usage === 'full' ? 'selected' : ''}>Full — text IS the content</option>
                        <option value="summary" ${r.transcript_usage === 'summary' ? 'selected' : ''}>Summary — supporting text</option>
                        <option value="none" ${r.transcript_usage === 'none' ? 'selected' : ''}>None — no meaningful text</option>
                    </select>
                    ${r.transcript_rationale ? `<div style="font-size:0.72rem;color:#86868b;margin-top:0.25rem;font-style:italic;">${esc(r.transcript_rationale)}</div>` : ''}

                    <label>Category</label>
                    <select id="cat-${img.id}">
                        ${CATEGORIES.map(c => `<option value="${c}" ${r.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>

                    ${r.quote_text ? `
                        <label>Quote</label>
                        <textarea id="quote-${img.id}" rows="2">${esc(r.quote_text)}</textarea>
                        <label>Attribution</label>
                        <input type="text" id="attr-${img.id}" value="${esc(r.quote_attribution || '')}">
                    ` : ''}
                </div>`;
            }
            // Read-only display
            const usageBadge = r.transcript_usage === 'full' ? 'badge-full' :
                               r.transcript_usage === 'summary' ? 'badge-summary' : 'badge-none';
            return `<div class="result-display">
                <div class="result-section">
                    <div class="result-label">Description</div>
                    <div class="result-text">${esc(r.description || 'N/A')}</div>
                </div>
                ${r.transcript ? `<div class="result-section">
                    <div class="result-label">Transcript ${r.transcript_usage ? `<span class="badge ${usageBadge}">${r.transcript_usage}</span>` : ''}</div>
                    <div class="result-text transcript">${esc(r.transcript)}</div>
                </div>` : ''}
                <div class="result-section">
                    <div class="result-label">Category</div>
                    <span class="result-category">${esc(r.category || 'N/A')}</span>
                </div>
                ${r.quote_text ? `<div class="result-section">
                    <div class="result-label">Quote</div>
                    <div class="result-text quote-text">${esc(r.quote_text)}</div>
                    <div style="font-size:0.78rem;color:#86868b;margin-top:0.2rem;">— ${esc(r.quote_attribution || 'Unknown')}</div>
                </div>` : ''}
            </div>`;
        }

        function toggleSelectAll() {
            const pending = images.filter(i => i.status === 'pending');
            const allSelected = pending.every(i => i.selected);
            pending.forEach(i => i.selected = !allSelected);
            document.getElementById('selectAllBtn').textContent = allSelected ? 'Select All' : 'Deselect All';
            updateButtons();
            renderImages();
        }

        function toggleSelect(id) {
            const img = images.find(i => i.id === id);
            if (img) img.selected = !img.selected;
            updateButtons();
            renderImages();
        }

        function openModal(src) {
            document.getElementById('modalImage').src = src;
            document.getElementById('imageModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('imageModal').classList.remove('active');
        }

        function markIncorrect(id) {
            const img = images.find(i => i.id === id);
            if (!img) return;
            img.result = null;
            img.status = 'pending';
            img.selected = true;
            updateStats();
            updateCategorySummary();
            switchTab('pending');
            renderImages();
        }

        async function analyzeSelected() {
            const toAnalyze = images.filter(i => i.selected && i.status === 'pending');
            if (toAnalyze.length === 0) return;

            const btn = document.getElementById('analyzeBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span>Analyzing...';

            for (const img of toAnalyze) {
                img.status = 'analyzing';
                renderImages();

                try {
                    const res = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            image_id: img.id,
                            backend: selectedBackend,
                            model: selectedModel
                        })
                    });
                    const result = await res.json();
                    if (result.error) {
                        showToast(`Error: ${result.error}`, true);
                        img.status = 'pending';
                    } else {
                        img.result = result;
                        img.status = 'analyzed';
                        img.selected = false;
                    }
                } catch (e) {
                    showToast(`Failed to analyze ${img.src}`, true);
                    img.status = 'pending';
                }
                updateStats();
                renderImages();
            }

            btn.innerHTML = 'Analyze Selected';
            updateButtons();
            updateCategorySummary();
            showToast(`Analyzed ${toAnalyze.length} images`);
            switchTab('analyzed');
        }

        function approveImage(id) {
            const img = images.find(i => i.id === id);
            if (!img) return;

            // Read edited values
            const fields = ['desc', 'transcript', 'tusage', 'cat', 'quote', 'attr'];
            const descEl = document.getElementById(`desc-${id}`);
            const transcriptEl = document.getElementById(`transcript-${id}`);
            const tusageEl = document.getElementById(`tusage-${id}`);
            const catEl = document.getElementById(`cat-${id}`);
            const quoteEl = document.getElementById(`quote-${id}`);
            const attrEl = document.getElementById(`attr-${id}`);

            if (descEl) img.result.description = descEl.value;
            if (transcriptEl) img.result.transcript = transcriptEl.value;
            if (tusageEl) img.result.transcript_usage = tusageEl.value;
            if (catEl) img.result.category = catEl.value;
            if (quoteEl) img.result.quote_text = quoteEl.value;
            if (attrEl) img.result.quote_attribution = attrEl.value;

            img.status = 'approved';
            updateStats();
            updateCategorySummary();
            renderImages();
        }

        function unapproveImage(id) {
            const img = images.find(i => i.id === id);
            if (img) {
                img.status = 'analyzed';
                updateStats();
                switchTab('analyzed');
                renderImages();
            }
        }

        function approveAll() {
            images.filter(i => i.status === 'analyzed').forEach(img => {
                const descEl = document.getElementById(`desc-${img.id}`);
                const transcriptEl = document.getElementById(`transcript-${img.id}`);
                const tusageEl = document.getElementById(`tusage-${img.id}`);
                const catEl = document.getElementById(`cat-${img.id}`);
                if (descEl) img.result.description = descEl.value;
                if (transcriptEl) img.result.transcript = transcriptEl.value;
                if (tusageEl) img.result.transcript_usage = tusageEl.value;
                if (catEl) img.result.category = catEl.value;
                img.status = 'approved';
            });
            updateStats();
            updateCategorySummary();
            renderImages();
            showToast('All analyzed images approved');
        }

        async function saveApproved() {
            const approved = images.filter(i => i.status === 'approved');
            if (approved.length === 0) return;

            const btn = document.getElementById('saveBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span>Saving...';

            try {
                const res = await fetch('/api/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        results: approved.map(img => ({ id: img.id, result: img.result }))
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Saved ${approved.length} results`);
                    approved.forEach(img => img.status = 'existing');
                    updateStats();
                    updateCategorySummary();
                    renderImages();
                } else {
                    showToast('Failed to save: ' + data.error, true);
                }
            } catch (e) {
                showToast('Failed to save results', true);
            }

            btn.innerHTML = 'Save to presentation.json';
            updateButtons();
        }

        // === Entity Review ===
        async function loadEntities() {
            try {
                const res = await fetch('/api/entities');
                entities = await res.json();
            } catch (e) { entities = {}; }
        }

        function switchEntityTab(tab) {
            currentEntityTab = tab;
            document.querySelectorAll('[data-entitytab]').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-entitytab="${tab}"]`).classList.add('active');
            editingEntity = null;
            renderEntities();
        }

        function renderEntities() {
            const container = document.getElementById('entityContent');
            const items = entities[currentEntityTab] || [];
            const renderers = {
                people: renderPersonCard, quotes: renderQuoteCard, tools: renderToolCard,
                organizations: renderOrgCard, terms: renderTermCard, dates: renderDateCard,
                activities: renderActivityCard, links: renderLinkCard,
            };
            const renderer = renderers[currentEntityTab] || renderGenericCard;
            let html = `<div class="entity-section">
                <div class="entity-section-header">
                    <h3>${currentEntityTab.charAt(0).toUpperCase() + currentEntityTab.slice(1)}</h3>
                    <span class="count">${items.length} items</span>
                </div>
                <button onclick="addEntity('${currentEntityTab}')" class="primary" style="margin-bottom:0.75rem;">+ Add</button>`;
            if (items.length === 0) {
                html += `<div class="empty-state"><h2>No ${currentEntityTab} yet</h2></div>`;
            } else {
                html += items.map((item, idx) => {
                    const isEditing = editingEntity && editingEntity.type === currentEntityTab && editingEntity.index === idx;
                    return renderer(item, idx, isEditing);
                }).join('');
            }
            html += '</div>';
            container.innerHTML = html;
        }

        function renderPersonCard(item, idx, isEditing) {
            if (isEditing) return editCard('people', idx, [
                {key:'name', label:'Name', value:item.name},
                {key:'role', label:'Role', value:item.role}
            ]);
            return readCard([
                {label:'Name', value:item.name}, {label:'Role', value:item.role}
            ], item.mentions, 'people', idx);
        }

        function renderQuoteCard(item, idx, isEditing) {
            if (isEditing) return editCard('quotes', idx, [
                {key:'text', label:'Text', value:item.text, rows:4},
                {key:'attribution', label:'Attribution', value:item.attribution},
                {key:'source', label:'Source', value:item.source},
                {key:'slideIndex', label:'Slide', value:item.slideIndex, type:'number'},
                {key:'topic', label:'Topic', value:item.topic}
            ]);
            return `<div class="entity-card">
                <div class="entity-field"><div class="result-text quote-text" style="border-left:3px solid #0071e3;padding-left:0.6rem;font-style:italic;">"${esc(truncate(item.text||'',200))}"</div></div>
                <div class="entity-field"><label>Attribution</label><span class="value">${esc(item.attribution||'')}</span></div>
                ${item.source ? `<div class="entity-field"><label>Source</label><span class="value">${esc(item.source)}</span></div>` : ''}
                ${item.slideIndex!=null ? `<div class="entity-mentions"><span>Slide ${item.slideIndex}</span></div>` : ''}
                ${item.topic ? `<div class="entity-mentions"><span>${esc(item.topic)}</span></div>` : ''}
                <div class="entity-actions">
                    <button onclick="startEdit('quotes',${idx})" class="secondary">Edit</button>
                    <button onclick="deleteEntity('quotes',${idx})" class="danger">Delete</button>
                </div>
            </div>`;
        }

        function renderToolCard(item, idx, isEditing) {
            if (isEditing) return editCard('tools', idx, [
                {key:'name', label:'Name', value:item.name},
                {key:'maker', label:'Maker', value:item.maker},
                {key:'type', label:'Type', value:item.type}
            ]);
            return readCard([
                {label:'Name', value:item.name}, {label:'Maker', value:item.maker}, {label:'Type', value:item.type}
            ].filter(f=>f.value), item.mentions, 'tools', idx);
        }

        function renderOrgCard(item, idx, isEditing) {
            if (isEditing) return editCard('organizations', idx, [
                {key:'name', label:'Name', value:item.name},
                {key:'type', label:'Type', value:item.type}
            ]);
            return readCard([
                {label:'Name', value:item.name}, {label:'Type', value:item.type}
            ].filter(f=>f.value), item.mentions, 'organizations', idx);
        }

        function renderTermCard(item, idx, isEditing) {
            if (isEditing) return editCard('terms', idx, [
                {key:'term', label:'Term', value:item.term},
                {key:'definition', label:'Definition', value:item.definition, rows:3},
                {key:'slideIndex', label:'Slide', value:item.slideIndex, type:'number'}
            ]);
            return readCard([
                {label:'Term', value:item.term}, {label:'Definition', value:item.definition}
            ], null, 'terms', idx, item.slideIndex);
        }

        function renderDateCard(item, idx, isEditing) {
            if (isEditing) return editCard('dates', idx, [
                {key:'date', label:'Date', value:item.date},
                {key:'event', label:'Event', value:item.event, rows:2},
                {key:'significance', label:'Significance', value:item.significance, rows:2},
                {key:'slideIndex', label:'Slide', value:item.slideIndex, type:'number'}
            ]);
            return readCard([
                {label:'Date', value:item.date}, {label:'Event', value:item.event},
                {label:'Significance', value:item.significance}
            ].filter(f=>f.value), null, 'dates', idx, item.slideIndex);
        }

        function renderActivityCard(item, idx, isEditing) {
            if (isEditing) return editCard('activities', idx, [
                {key:'title', label:'Title', value:item.title},
                {key:'description', label:'Description', value:item.description, rows:3},
                {key:'section', label:'Section', value:item.section},
                {key:'slideIndex', label:'Slide', value:item.slideIndex, type:'number'}
            ]);
            return readCard([
                {label:'Title', value:item.title},
                {label:'Description', value:truncate(item.description||'',200)},
                {label:'Section', value:item.section}
            ].filter(f=>f.value), null, 'activities', idx, item.slideIndex);
        }

        function renderLinkCard(item, idx, isEditing) {
            if (isEditing) return editCard('links', idx, [
                {key:'url', label:'URL', value:item.url},
                {key:'label', label:'Label', value:item.label},
                {key:'linkType', label:'Type', value:item.linkType},
                {key:'slideIndex', label:'Slide', value:item.slideIndex, type:'number'}
            ]);
            return `<div class="entity-card">
                <div class="entity-field"><label>Label</label><span class="value">${esc(item.label||'')}</span></div>
                <div class="entity-field"><label>URL</label><span class="value"><a href="${esc(item.url||'')}" target="_blank" style="color:#0071e3;">${esc(truncate(item.url||'',60))}</a></span></div>
                ${item.linkType ? `<div class="entity-field"><label>Type</label><span class="value">${esc(item.linkType)}</span></div>` : ''}
                ${item.slideIndex!=null ? `<div class="entity-mentions"><span>Slide ${item.slideIndex}</span></div>` : ''}
                <div class="entity-actions">
                    <button onclick="startEdit('links',${idx})" class="secondary">Edit</button>
                    <button onclick="deleteEntity('links',${idx})" class="danger">Delete</button>
                </div>
            </div>`;
        }

        function renderGenericCard(item, idx) {
            return `<div class="entity-card">
                <pre style="font-size:0.78rem;white-space:pre-wrap;">${esc(JSON.stringify(item,null,2))}</pre>
                <div class="entity-actions">
                    <button onclick="deleteEntity('${currentEntityTab}',${idx})" class="danger">Delete</button>
                </div>
            </div>`;
        }

        // Generic card builders
        function editCard(type, idx, fields) {
            let html = `<div class="entity-card editing">`;
            for (const f of fields) {
                html += `<div class="entity-field"><label>${f.label}</label>`;
                const val = f.value != null ? f.value : '';
                if (f.rows) {
                    html += `<textarea id="edit-${f.key}-${idx}" rows="${f.rows}">${esc(String(val))}</textarea>`;
                } else {
                    html += `<input type="text" id="edit-${f.key}-${idx}" value="${esc(String(val))}">`;
                }
                html += `</div>`;
            }
            html += `<div class="entity-actions">
                <button onclick="saveEntityEdit('${type}',${idx})" class="success">Save</button>
                <button onclick="cancelEdit()" class="secondary">Cancel</button>
                <button onclick="deleteEntity('${type}',${idx})" class="danger">Delete</button>
            </div></div>`;
            return html;
        }

        function readCard(fields, mentions, type, idx, slideIndex) {
            let html = `<div class="entity-card">`;
            for (const f of fields) {
                html += `<div class="entity-field"><label>${f.label}</label><span class="value">${esc(f.value||'')}</span></div>`;
            }
            if (mentions) html += renderMentions(mentions);
            if (slideIndex != null) html += `<div class="entity-mentions"><span>Slide ${slideIndex}</span></div>`;
            html += `<div class="entity-actions">
                <button onclick="startEdit('${type}',${idx})" class="secondary">Edit</button>
                <button onclick="deleteEntity('${type}',${idx})" class="danger">Delete</button>
            </div></div>`;
            return html;
        }

        function renderMentions(mentions) {
            if (!mentions || mentions.length === 0) return '';
            return `<div class="entity-mentions">
                ${mentions.map(m => `<span>Slide ${m.slideIndex}${m.context ? ': '+esc(truncate(m.context,40)) : ''}</span>`).join('')}
            </div>`;
        }

        function startEdit(type, index) { editingEntity = {type, index}; renderEntities(); }
        function cancelEdit() { editingEntity = null; renderEntities(); }

        function saveEntityEdit(type, index) {
            const item = entities[type][index];
            // Dynamically read all edit- fields
            const editEls = document.querySelectorAll(`[id^="edit-"][id$="-${index}"]`);
            editEls.forEach(el => {
                const key = el.id.replace(`edit-`, '').replace(`-${index}`, '');
                let val = el.value;
                if (key === 'slideIndex') val = val !== '' ? parseInt(val) : null;
                item[key] = val;
            });
            editingEntity = null;
            renderEntities();
            showToast('Updated (remember to Save)');
        }

        function deleteEntity(type, index) {
            if (!confirm('Delete this item?')) return;
            entities[type].splice(index, 1);
            editingEntity = null;
            renderEntities();
            showToast('Deleted (remember to Save)');
        }

        function addEntity(type) {
            if (!entities[type]) entities[type] = [];
            const templates = {
                people: {name:'', role:'', mentions:[]},
                quotes: {text:'', attribution:'', source:'', slideIndex:null, topic:''},
                tools: {name:'', maker:'', type:'', mentions:[]},
                organizations: {name:'', type:'', mentions:[]},
                terms: {term:'', definition:'', slideIndex:null},
                dates: {date:'', event:'', significance:'', slideIndex:null},
                activities: {title:'', description:'', section:'', slideIndex:null},
                links: {url:'', label:'', linkType:'', slideIndex:null},
            };
            entities[type].unshift(templates[type] || {});
            editingEntity = {type, index: 0};
            renderEntities();
        }

        // === Entity Prompt ===
        async function loadEntityPrompt() {
            try {
                const res = await fetch('/api/entity-prompt');
                const data = await res.json();
                defaultEntityPrompt = data.default_prompt;
                currentEntityPrompt = data.current_prompt;
                document.getElementById('entityPromptText').value = currentEntityPrompt;
            } catch(e) {}
        }

        function toggleEntityPrompt() {
            const body = document.getElementById('entityPromptBody');
            const toggle = document.getElementById('entityPromptToggle');
            if (body.classList.contains('open')) {
                body.classList.remove('open');
                toggle.textContent = 'Show ▼';
            } else {
                body.classList.add('open');
                toggle.textContent = 'Hide ▲';
            }
        }

        function resetEntityPrompt() {
            document.getElementById('entityPromptText').value = defaultEntityPrompt;
            currentEntityPrompt = defaultEntityPrompt;
            saveEntityPrompt();
        }

        async function saveEntityPrompt() {
            currentEntityPrompt = document.getElementById('entityPromptText').value;
            try {
                await fetch('/api/entity-prompt', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({prompt: currentEntityPrompt})
                });
                showToast('Entity prompt saved');
            } catch(e) { showToast('Failed to save', true); }
        }

        // === Entity Extraction ===
        async function extractEntities() {
            const backend = document.getElementById('entityBackendSelect').value;
            const model = document.getElementById('entityModelSelect').value;
            if (!backend || !model) return;

            const userNotes = document.getElementById('entityUserNotes').value;

            const btn = document.getElementById('extractEntitiesBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span>Extracting...';

            try {
                const res = await fetch('/api/entities/extract', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({backend, model, user_notes: userNotes})
                });
                const data = await res.json();
                if (data.error) {
                    showToast('Error: ' + data.error, true);
                } else {
                    // Merge extracted entities with existing
                    entities = data;
                    renderEntities();
                    showToast('Entities extracted (review and Save)');
                }
            } catch(e) { showToast('Extraction failed', true); }

            btn.disabled = false;
            btn.innerHTML = 'Re-extract Entities';
            updateEntityButtons();
        }

        // === Auto-populate from image analysis ===
        function autoPopulateEntities() {
            let added = {people: 0, quotes: 0};
            const existingPeople = new Set((entities.people||[]).map(p => p.name.toLowerCase()));
            const existingQuotes = new Set((entities.quotes||[]).map(q => (q.text||'').substring(0,50).toLowerCase()));

            if (!entities.people) entities.people = [];
            if (!entities.quotes) entities.quotes = [];

            images.forEach(img => {
                if (!img.result) return;
                const r = img.result;

                // Add quotes from quote-category images
                if (r.quote_text && r.quote_text.trim()) {
                    const qKey = r.quote_text.substring(0,50).toLowerCase();
                    if (!existingQuotes.has(qKey)) {
                        entities.quotes.push({
                            text: r.quote_text,
                            attribution: r.quote_attribution || '',
                            source: 'Image: ' + img.src,
                            slideIndex: img.slideOrder,
                            topic: ''
                        });
                        existingQuotes.add(qKey);
                        added.quotes++;
                    }

                    // Also add the person who said the quote
                    if (r.quote_attribution) {
                        const name = r.quote_attribution.replace(/^@/, '').trim();
                        if (name && !existingPeople.has(name.toLowerCase())) {
                            entities.people.push({
                                name: name,
                                role: 'Quoted in presentation',
                                mentions: [{slideIndex: img.slideOrder, context: 'Quote attribution'}]
                            });
                            existingPeople.add(name.toLowerCase());
                            added.people++;
                        }
                    }
                }

                // For transcript with full usage, check for quotable content
                if (r.transcript_usage === 'full' && r.category === 'tweet' && r.transcript) {
                    const qKey = r.transcript.substring(0,50).toLowerCase();
                    if (!existingQuotes.has(qKey)) {
                        entities.quotes.push({
                            text: r.transcript,
                            attribution: r.quote_attribution || '',
                            source: 'Tweet image: ' + img.src,
                            slideIndex: img.slideOrder,
                            topic: ''
                        });
                        existingQuotes.add(qKey);
                        added.quotes++;
                    }
                }
            });

            renderEntities();
            showToast(`Added ${added.people} people, ${added.quotes} quotes (review and Save)`);
        }

        async function saveEntities() {
            const btn = document.getElementById('saveEntitiesBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span>Saving...';
            try {
                const res = await fetch('/api/entities/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(entities)
                });
                const data = await res.json();
                if (data.success) showToast('Saved entities.json');
                else showToast('Failed: ' + data.error, true);
            } catch (e) { showToast('Failed to save', true); }
            btn.disabled = false;
            btn.innerHTML = 'Save entities.json';
        }

        // === Utilities ===
        function esc(str) {
            if (str == null) return '';
            const div = document.createElement('div');
            div.textContent = String(str);
            return div.innerHTML;
        }
        function truncate(str, max) { return str.length > max ? str.slice(0, max) + '...' : str; }
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
        init();
    </script>
</body>
</html>
'''


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def send_html(self, html):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/' or path == '/index.html':
            self.send_html(HTML_TEMPLATE)

        elif path == '/api/backends':
            try:
                mod = get_analyze_module()
                backends = mod.list_available_backends()
                self.send_json(backends)
            except Exception:
                self.send_json({})

        elif path == '/api/images':
            images = self.get_image_list()
            self.send_json(images)

        elif path == '/api/entities':
            self.send_json(state.entities_data)

        elif path == '/api/prompt':
            self.send_json({
                'default_prompt': DEFAULT_PROMPT,
                'current_prompt': state.custom_prompt or DEFAULT_PROMPT
            })

        elif path == '/api/entity-prompt':
            self.send_json({
                'default_prompt': DEFAULT_ENTITY_PROMPT,
                'current_prompt': state.custom_entity_prompt or DEFAULT_ENTITY_PROMPT
            })

        elif path == '/api/text-backends':
            self.send_json(self.get_text_backends())

        elif path.startswith('/image/'):
            from urllib.parse import unquote
            image_src = unquote(path[7:])
            self.serve_image(image_src)

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_json({'error': 'Invalid JSON'}, 400)
            return

        if path == '/api/analyze':
            self.handle_analyze(data)
        elif path == '/api/save':
            self.handle_save(data)
        elif path == '/api/entities/save':
            self.handle_entities_save(data)
        elif path == '/api/prompt':
            state.custom_prompt = data.get('prompt', DEFAULT_PROMPT)
            self.send_json({'success': True})
        elif path == '/api/entity-prompt':
            state.custom_entity_prompt = data.get('prompt', DEFAULT_ENTITY_PROMPT)
            self.send_json({'success': True})
        elif path == '/api/apikey':
            key = data.get('key', '')
            state.runtime_api_key = key if key else None
            if key:
                import os
                os.environ['GEMINI_API_KEY'] = key
            self.send_json({'success': True})
        elif path == '/api/entities/extract':
            self.handle_entity_extraction(data)
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def get_text_backends(self) -> dict:
        """List all backends with ALL models (not just vision) for text tasks."""
        from urllib.request import Request, urlopen
        from urllib.error import URLError
        import os
        backends = {}

        # LM Studio — all models
        try:
            req = Request("http://localhost:1234/v1/models", method="GET")
            with urlopen(req, timeout=2) as response:
                data = json.loads(response.read().decode())
                models = [{"id": m["id"], "name": m.get("id", "Unknown")} for m in data.get("data", [])]
                if models:
                    backends["lmstudio"] = {"url": "http://localhost:1234", "models": models}
        except (URLError, OSError):
            pass

        # Ollama — all models
        try:
            req = Request("http://localhost:11434/api/tags", method="GET")
            with urlopen(req, timeout=2) as response:
                data = json.loads(response.read().decode())
                models = [{"id": m["name"], "name": m["name"]} for m in data.get("models", [])]
                if models:
                    backends["ollama"] = {"url": "http://localhost:11434", "models": models}
        except (URLError, OSError):
            pass

        # Gemini — always show as option, user provides key in UI
        api_key = state.runtime_api_key or os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        needs_key = " (enter API key)" if not api_key else ""
        backends["gemini"] = {"models": [
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash" + needs_key},
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro" + needs_key},
        ]}

        return backends

    def get_image_list(self) -> list:
        """Extract all images from presentation data."""
        images = []
        image_id = 0

        for section in state.presentation_data.get('sections', []):
            for slide in section.get('slides', []):
                slide_title = slide.get('title', '')

                for idx, content in enumerate(slide.get('content', [])):
                    if content.get('type') == 'image':
                        src = content.get('src', '')
                        has_analysis = bool(content.get('description') and content.get('category'))

                        images.append({
                            'id': f"{slide.get('order', 0)}_{idx}",
                            'src': src,
                            'slideTitle': slide_title,
                            'slideOrder': slide.get('order', 0),
                            'contentIndex': idx,
                            'status': 'existing' if has_analysis else 'pending',
                            'selected': False,
                            'result': {
                                'description': content.get('description'),
                                'transcript': content.get('transcript', ''),
                                'transcript_usage': content.get('transcript_usage', ''),
                                'category': content.get('category'),
                                'quote_text': content.get('quote_text'),
                                'quote_attribution': content.get('quote_attribution')
                            } if has_analysis else None
                        })
                        image_id += 1

        return images

    def serve_image(self, image_src: str):
        """Serve an image file."""
        if image_src.startswith('/'):
            image_path = state.public_dir / image_src.lstrip('/')
        elif image_src.startswith('./'):
            image_path = state.public_dir / image_src[2:]
        else:
            image_path = state.public_dir / image_src

        if not image_path.exists():
            self.send_response(404)
            self.end_headers()
            return

        suffix = image_path.suffix.lower()
        content_types = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp'
        }
        content_type = content_types.get(suffix, 'application/octet-stream')

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Cache-Control', 'max-age=3600')
        self.end_headers()

        with open(image_path, 'rb') as f:
            self.wfile.write(f.read())

    def handle_analyze(self, data: dict):
        """Analyze a single image using the custom prompt."""
        image_id = data.get('image_id')
        backend = data.get('backend')
        model = data.get('model')

        if not all([image_id, backend, model]):
            self.send_json({'error': 'Missing required fields'}, 400)
            return

        image_info = self.find_image_by_id(image_id)
        if not image_info:
            self.send_json({'error': 'Image not found'}, 404)
            return

        src = image_info['content'].get('src', '')
        slide_title = image_info['slide'].get('title', '')

        if src.startswith('/'):
            image_path = state.public_dir / src.lstrip('/')
        elif src.startswith('./'):
            image_path = state.public_dir / src[2:]
        else:
            image_path = state.public_dir / src

        if not image_path.exists():
            self.send_json({'error': f'Image file not found: {image_path}'}, 404)
            return

        # Use custom prompt if set
        mod = get_analyze_module()

        # Always override the prompt to use the review server's version (which includes transcript)
        original_get_prompt = mod.get_analysis_prompt
        prompt_template = state.custom_prompt or DEFAULT_PROMPT
        categories_list = ", ".join(mod.VALID_CATEGORIES)
        context = f" from slide '{slide_title}'" if slide_title else ""
        def custom_prompt_fn(st=None):
            return prompt_template.format(
                context=context,
                categories=categories_list
            )
        mod.get_analysis_prompt = custom_prompt_fn

        try:
            result = mod.analyze_image(image_path, backend, model, slide_title)
        finally:
            mod.get_analysis_prompt = original_get_prompt

        if result:
            self.send_json(result)
        else:
            self.send_json({'error': 'Analysis failed'}, 500)

    def handle_save(self, data: dict):
        """Save approved results to presentation.json."""
        results = data.get('results', [])

        if not results:
            self.send_json({'error': 'No results to save'}, 400)
            return

        for item in results:
            image_id = item.get('id')
            result = item.get('result', {})

            image_info = self.find_image_by_id(image_id)
            if image_info:
                content = image_info['content']
                content['description'] = result.get('description')
                content['category'] = result.get('category')
                # Save transcript fields
                if result.get('transcript'):
                    content['transcript'] = result.get('transcript')
                if result.get('transcript_usage'):
                    content['transcript_usage'] = result.get('transcript_usage')
                if result.get('quote_text'):
                    content['quote_text'] = result.get('quote_text')
                    content['quote_attribution'] = result.get('quote_attribution')

        try:
            with open(state.json_path, 'w', encoding='utf-8') as f:
                json.dump(state.presentation_data, f, indent=2, ensure_ascii=False)
            self.send_json({'success': True, 'saved': len(results)})
        except Exception as e:
            self.send_json({'error': str(e)}, 500)

    def handle_entities_save(self, data: dict):
        """Save entities to entities.json."""
        try:
            state.entities_data = data
            with open(state.entities_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            self.send_json({'success': True})
        except Exception as e:
            self.send_json({'error': str(e)}, 500)

    def get_presentation_text(self) -> str:
        """Extract all text from presentation for entity extraction."""
        lines = []
        for section in state.presentation_data.get('sections', []):
            for slide in section.get('slides', []):
                order = slide.get('order', '?')
                title = slide.get('title', '')
                lines.append(f"\n--- Slide {order}: {title} ---")
                for content in slide.get('content', []):
                    ctype = content.get('type', '')
                    if ctype == 'text':
                        lines.append(content.get('text', ''))
                    elif ctype == 'heading':
                        lines.append(f"## {content.get('text', '')}")
                    elif ctype == 'list':
                        for item in content.get('items', []):
                            lines.append(f"- {item}")
                    elif ctype == 'image':
                        desc = content.get('description', '')
                        transcript = content.get('transcript', '')
                        if desc:
                            lines.append(f"[Image: {desc}]")
                        if transcript:
                            lines.append(f"[Image transcript: {transcript}]")
                        qt = content.get('quote_text', '')
                        qa = content.get('quote_attribution', '')
                        if qt:
                            lines.append(f'[Quote from image: "{qt}" — {qa}]')
        return "\n".join(lines)

    def handle_entity_extraction(self, data: dict):
        """Extract entities from presentation text using a vision/language model."""
        backend = data.get('backend')
        model = data.get('model')
        user_notes = data.get('user_notes', '')

        if not backend or not model:
            self.send_json({'error': 'Missing backend or model'}, 400)
            return

        slide_text = self.get_presentation_text()
        prompt_template = state.custom_entity_prompt or DEFAULT_ENTITY_PROMPT

        try:
            prompt = prompt_template.format(
                slide_text=slide_text,
                user_notes=f"\nAdditional user notes:\n{user_notes}" if user_notes else ""
            )
        except KeyError as e:
            self.send_json({'error': f'Prompt template error: {e}'}, 400)
            return

        # Use the analyze module's backend infrastructure
        mod = get_analyze_module()

        try:
            if backend == 'gemini':
                result_text = self._call_gemini_text(prompt, model)
            elif backend == 'lmstudio':
                result_text = self._call_openai_text(prompt, model, "http://localhost:1234")
            elif backend == 'ollama':
                result_text = self._call_ollama_text(prompt, model)
            else:
                self.send_json({'error': f'Unknown backend: {backend}'}, 400)
                return

            if not result_text:
                self.send_json({'error': 'Empty response from model'}, 500)
                return

            parsed = mod.parse_json_response(result_text)
            if parsed:
                self.send_json(parsed)
            else:
                self.send_json({'error': 'Failed to parse response'}, 500)
        except Exception as e:
            self.send_json({'error': str(e)}, 500)

    def _call_gemini_text(self, prompt: str, model: str) -> Optional[str]:
        """Call Gemini with text-only prompt."""
        import os
        api_key = state.runtime_api_key or os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            raise Exception('No Gemini API key — enter one in the API key field')
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=model,
                contents=[prompt]
            )
            return (response.text or "").strip()
        except ImportError:
            raise Exception('google-genai package required: pip install google-genai')

    def _call_openai_text(self, prompt: str, model: str, base_url: str) -> Optional[str]:
        """Call OpenAI-compatible API with text-only prompt."""
        from urllib.request import Request, urlopen
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4000,
            "temperature": 0.1
        }
        req = Request(
            f"{base_url}/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode())
            return data["choices"][0]["message"]["content"].strip()

    def _call_ollama_text(self, prompt: str, model: str) -> Optional[str]:
        """Call Ollama with text-only prompt."""
        from urllib.request import Request, urlopen
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1}
        }
        req = Request(
            "http://localhost:11434/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode())
            return data.get("response", "").strip()

    def find_image_by_id(self, image_id: str) -> Optional[dict]:
        """Find image content and slide by ID."""
        try:
            slide_order, content_idx = image_id.split('_')
            slide_order = int(slide_order)
            content_idx = int(content_idx)
        except ValueError:
            return None

        for section in state.presentation_data.get('sections', []):
            for slide in section.get('slides', []):
                if slide.get('order') == slide_order:
                    content_list = slide.get('content', [])
                    if content_idx < len(content_list):
                        return {
                            'slide': slide,
                            'content': content_list[content_idx]
                        }
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Web UI for reviewing image analysis and entity extraction results"
    )
    parser.add_argument("site_dir", help="Site directory containing src/data/presentation.json")
    parser.add_argument("--port", type=int, default=8765, help="Port to run server on (default: 8765)")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser automatically")

    args = parser.parse_args()

    site_dir = Path(args.site_dir)
    json_path = site_dir / "src" / "data" / "presentation.json"

    if not json_path.exists():
        print(f"Error: presentation.json not found at {json_path}")
        sys.exit(1)

    with open(json_path, 'r', encoding='utf-8') as f:
        state.presentation_data = json.load(f)

    state.site_dir = site_dir
    state.json_path = json_path
    state.public_dir = site_dir / "public"

    entities_path = site_dir / "src" / "data" / "entities.json"
    state.entities_path = entities_path
    if entities_path.exists():
        with open(entities_path, 'r', encoding='utf-8') as f:
            state.entities_data = json.load(f)
        print(f"Loaded entities.json with {sum(len(v) for v in state.entities_data.values() if isinstance(v, list))} total entities")
    else:
        state.entities_data = {
            "people": [], "organizations": [], "quotes": [],
            "tools": [], "terms": [], "dates": [], "images": []
        }
        print("No entities.json found, starting with empty entities")

    total_images = sum(
        1 for section in state.presentation_data.get('sections', [])
        for slide in section.get('slides', [])
        for content in slide.get('content', [])
        if content.get('type') == 'image'
    )

    print(f"Loaded presentation with {total_images} images")
    print(f"Starting review server at http://localhost:{args.port}")
    print("Press Ctrl+C to stop\n")

    server = HTTPServer(('localhost', args.port), RequestHandler)

    if not args.no_browser:
        def open_browser():
            time.sleep(0.5)
            webbrowser.open(f"http://localhost:{args.port}")
        threading.Thread(target=open_browser, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
