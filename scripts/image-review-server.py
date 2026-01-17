#!/usr/bin/env python3
"""
Web UI for reviewing and approving AI image analysis results.
Launches a local server where users can:
1. Select backend and model
2. Choose which images to analyze
3. Review and edit results before saving
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
        # Import the analyze script as a module
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
        self.public_dir: Optional[Path] = None
        self.pending_results: dict = {}  # image_id -> analysis result


state = AppState()


HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Analysis Review</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a2e;
            color: #eee;
            min-height: 100vh;
        }
        .header {
            background: #16213e;
            padding: 1rem 2rem;
            border-bottom: 1px solid #0f3460;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .header h1 { font-size: 1.5rem; color: #e94560; }
        .controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }
        select, button {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: 1px solid #0f3460;
            background: #16213e;
            color: #eee;
            font-size: 0.9rem;
            cursor: pointer;
        }
        select:hover, button:hover { border-color: #e94560; }
        button.primary {
            background: #e94560;
            border-color: #e94560;
            font-weight: 600;
        }
        button.primary:hover { background: #c73e54; }
        button.success { background: #2ecc71; border-color: #2ecc71; }
        button.success:hover { background: #27ae60; }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .stats {
            padding: 0.5rem 1rem;
            background: #0f3460;
            border-radius: 6px;
            font-size: 0.85rem;
        }
        .main { padding: 1.5rem; }
        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #0f3460;
            padding-bottom: 0.5rem;
        }
        .tab {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 1rem;
            border-bottom: 2px solid transparent;
        }
        .tab.active { color: #e94560; border-bottom-color: #e94560; }
        .tab:hover { color: #eee; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        .card {
            background: #16213e;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #0f3460;
            transition: border-color 0.2s;
        }
        .card:hover { border-color: #e94560; }
        .card.selected { border-color: #2ecc71; border-width: 2px; }
        .card.analyzed { border-color: #f39c12; }
        .card.approved { border-color: #2ecc71; }
        .card-image {
            width: 100%;
            height: 200px;
            object-fit: contain;
            background: #0a0a15;
            cursor: pointer;
        }
        .card-body { padding: 1rem; }
        .card-title {
            font-size: 0.85rem;
            color: #888;
            margin-bottom: 0.5rem;
            word-break: break-all;
        }
        .card-slide {
            font-size: 0.75rem;
            color: #e94560;
            margin-bottom: 0.75rem;
        }
        .card-status {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        .status-pending { background: #0f3460; color: #888; }
        .status-analyzing { background: #f39c12; color: #000; }
        .status-analyzed { background: #3498db; color: #fff; }
        .status-approved { background: #2ecc71; color: #fff; }
        .status-existing { background: #9b59b6; color: #fff; }
        .result-preview {
            background: #0a0a15;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
            margin-top: 0.75rem;
            max-height: 150px;
            overflow-y: auto;
        }
        .result-preview label {
            color: #e94560;
            font-weight: 600;
            display: block;
            margin-top: 0.5rem;
        }
        .result-preview label:first-child { margin-top: 0; }
        .result-preview p { color: #ccc; margin-top: 0.25rem; }
        .result-preview textarea {
            width: 100%;
            background: #16213e;
            border: 1px solid #0f3460;
            color: #eee;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            resize: vertical;
            margin-top: 0.25rem;
        }
        .result-preview select {
            width: 100%;
            margin-top: 0.25rem;
            padding: 0.35rem;
            font-size: 0.8rem;
        }
        .card-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }
        .card-actions button {
            flex: 1;
            padding: 0.4rem;
            font-size: 0.8rem;
        }
        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .checkbox-wrapper input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        .modal.active { display: flex; }
        .modal img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
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
            width: 20px;
            height: 20px;
            border: 2px solid #fff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: #2ecc71;
            color: #fff;
            border-radius: 8px;
            font-weight: 600;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s;
            z-index: 1001;
        }
        .toast.show { opacity: 1; transform: translateY(0); }
        .toast.error { background: #e74c3c; }
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #888;
        }
        .empty-state h2 { margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Image Analysis Review</h1>
        <div class="controls">
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
                Approve All Analyzed
            </button>
            <button onclick="saveApproved()" class="primary" id="saveBtn" disabled>
                Save & Exit
            </button>
        </div>
    </div>
    <div class="stats" id="stats">Loading...</div>
    <div class="main">
        <div class="tabs">
            <button class="tab active" data-tab="pending" onclick="switchTab('pending')">
                Pending <span id="pendingCount">(0)</span>
            </button>
            <button class="tab" data-tab="analyzed" onclick="switchTab('analyzed')">
                Analyzed <span id="analyzedCount">(0)</span>
            </button>
            <button class="tab" data-tab="approved" onclick="switchTab('approved')">
                Approved <span id="approvedCount">(0)</span>
            </button>
            <button class="tab" data-tab="existing" onclick="switchTab('existing')">
                Already Done <span id="existingCount">(0)</span>
            </button>
        </div>
        <div class="grid" id="imageGrid"></div>
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
        let currentTab = 'pending';
        let selectedBackend = '';
        let selectedModel = '';

        async function init() {
            await loadBackends();
            await loadImages();
            updateStats();
            renderImages();
        }

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
                showToast('Failed to load backends', true);
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
            } catch (e) {
                showToast('Failed to load images', true);
            }
        }

        function updateStats() {
            const pending = images.filter(i => i.status === 'pending').length;
            const analyzed = images.filter(i => i.status === 'analyzed').length;
            const approved = images.filter(i => i.status === 'approved').length;
            const existing = images.filter(i => i.status === 'existing').length;

            document.getElementById('stats').textContent =
                `Total: ${images.length} | Pending: ${pending} | Analyzed: ${analyzed} | Approved: ${approved} | Already done: ${existing}`;
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
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
            renderImages();
        }

        function renderImages() {
            const grid = document.getElementById('imageGrid');
            const filtered = images.filter(i => {
                if (currentTab === 'pending') return i.status === 'pending';
                if (currentTab === 'analyzed') return i.status === 'analyzed';
                if (currentTab === 'approved') return i.status === 'approved';
                if (currentTab === 'existing') return i.status === 'existing';
                return true;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="empty-state"><h2>No images in this category</h2></div>`;
                return;
            }

            grid.innerHTML = filtered.map(img => `
                <div class="card ${img.selected ? 'selected' : ''} ${img.status}">
                    <img class="card-image" src="/image/${encodeURIComponent(img.src)}"
                         alt="${img.src}" onclick="openModal('/image/${encodeURIComponent(img.src)}')">
                    <div class="card-body">
                        <div class="card-title">${img.src}</div>
                        <div class="card-slide">Slide: ${img.slideTitle || 'Unknown'}</div>
                        <span class="card-status status-${img.status}">${img.status.toUpperCase()}</span>
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
                                <button onclick="reanalyzeImage('${img.id}')">Re-analyze</button>
                            </div>
                        ` : ''}
                        ${img.status === 'approved' ? `
                            <div class="card-actions">
                                <button onclick="unapproveImage('${img.id}')">Edit</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        function renderResult(img) {
            const r = img.result;
            if (img.status === 'analyzed') {
                return `
                    <div class="result-preview">
                        <label>Description</label>
                        <textarea id="desc-${img.id}" rows="3">${r.description || ''}</textarea>
                        <label>Category</label>
                        <select id="cat-${img.id}">
                            ${CATEGORIES.map(c => `<option value="${c}" ${r.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                        ${r.quote_text ? `
                            <label>Quote</label>
                            <textarea id="quote-${img.id}" rows="2">${r.quote_text}</textarea>
                            <label>Attribution</label>
                            <input type="text" id="attr-${img.id}" value="${r.quote_attribution || ''}"
                                   style="width:100%;padding:0.35rem;background:#16213e;border:1px solid #0f3460;color:#eee;border-radius:4px;">
                        ` : ''}
                    </div>
                `;
            }
            return `
                <div class="result-preview">
                    <label>Description</label>
                    <p>${r.description || 'N/A'}</p>
                    <label>Category</label>
                    <p>${r.category || 'N/A'}</p>
                    ${r.quote_text ? `<label>Quote</label><p>"${r.quote_text}"</p><p>— ${r.quote_attribution || 'Unknown'}</p>` : ''}
                </div>
            `;
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
            showToast(`Analyzed ${toAnalyze.length} images`);
            switchTab('analyzed');
        }

        function approveImage(id) {
            const img = images.find(i => i.id === id);
            if (!img) return;

            // Get edited values
            const descEl = document.getElementById(`desc-${id}`);
            const catEl = document.getElementById(`cat-${id}`);
            const quoteEl = document.getElementById(`quote-${id}`);
            const attrEl = document.getElementById(`attr-${id}`);

            if (descEl) img.result.description = descEl.value;
            if (catEl) img.result.category = catEl.value;
            if (quoteEl) img.result.quote_text = quoteEl.value;
            if (attrEl) img.result.quote_attribution = attrEl.value;

            img.status = 'approved';
            updateStats();
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

        async function reanalyzeImage(id) {
            const img = images.find(i => i.id === id);
            if (!img) return;

            img.status = 'pending';
            img.selected = true;
            img.result = null;
            updateStats();
            switchTab('pending');
            renderImages();
        }

        function approveAll() {
            images.filter(i => i.status === 'analyzed').forEach(img => {
                const descEl = document.getElementById(`desc-${img.id}`);
                const catEl = document.getElementById(`cat-${img.id}`);
                if (descEl) img.result.description = descEl.value;
                if (catEl) img.result.category = catEl.value;
                img.status = 'approved';
            });
            updateStats();
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
                        results: approved.map(img => ({
                            id: img.id,
                            result: img.result
                        }))
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`Saved ${approved.length} results. You can close this window.`);
                    // Mark as existing after save
                    approved.forEach(img => img.status = 'existing');
                    updateStats();
                    renderImages();
                } else {
                    showToast('Failed to save: ' + data.error, true);
                }
            } catch (e) {
                showToast('Failed to save results', true);
            }

            btn.innerHTML = 'Save & Exit';
            updateButtons();
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show' + (isError ? ' error' : '');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        init();
    </script>
</body>
</html>
'''


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default logging
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
            mod = get_analyze_module()
            backends = mod.list_available_backends()
            self.send_json(backends)

        elif path == '/api/images':
            images = self.get_image_list()
            self.send_json(images)

        elif path.startswith('/image/'):
            # Serve image file
            from urllib.parse import unquote
            image_src = unquote(path[7:])  # Remove '/image/' prefix
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

        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

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

        # Determine content type
        suffix = image_path.suffix.lower()
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        content_type = content_types.get(suffix, 'application/octet-stream')

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Cache-Control', 'max-age=3600')
        self.end_headers()

        with open(image_path, 'rb') as f:
            self.wfile.write(f.read())

    def handle_analyze(self, data: dict):
        """Analyze a single image."""
        image_id = data.get('image_id')
        backend = data.get('backend')
        model = data.get('model')

        if not all([image_id, backend, model]):
            self.send_json({'error': 'Missing required fields'}, 400)
            return

        # Find the image in presentation data
        image_info = self.find_image_by_id(image_id)
        if not image_info:
            self.send_json({'error': 'Image not found'}, 404)
            return

        src = image_info['content'].get('src', '')
        slide_title = image_info['slide'].get('title', '')

        # Resolve image path
        if src.startswith('/'):
            image_path = state.public_dir / src.lstrip('/')
        elif src.startswith('./'):
            image_path = state.public_dir / src[2:]
        else:
            image_path = state.public_dir / src

        if not image_path.exists():
            self.send_json({'error': f'Image file not found: {image_path}'}, 404)
            return

        # Analyze the image
        mod = get_analyze_module()
        result = mod.analyze_image(image_path, backend, model, slide_title)

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

        # Update presentation data
        for item in results:
            image_id = item.get('id')
            result = item.get('result', {})

            image_info = self.find_image_by_id(image_id)
            if image_info:
                content = image_info['content']
                content['description'] = result.get('description')
                content['category'] = result.get('category')
                if result.get('quote_text'):
                    content['quote_text'] = result.get('quote_text')
                    content['quote_attribution'] = result.get('quote_attribution')

        # Save to file
        try:
            with open(state.json_path, 'w', encoding='utf-8') as f:
                json.dump(state.presentation_data, f, indent=2, ensure_ascii=False)
            self.send_json({'success': True, 'saved': len(results)})
        except Exception as e:
            self.send_json({'error': str(e)}, 500)

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
        description="Web UI for reviewing AI image analysis results"
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

    # Load presentation data
    with open(json_path, 'r', encoding='utf-8') as f:
        state.presentation_data = json.load(f)

    state.site_dir = site_dir
    state.json_path = json_path
    state.public_dir = site_dir / "public"

    # Count images
    total_images = sum(
        1 for section in state.presentation_data.get('sections', [])
        for slide in section.get('slides', [])
        for content in slide.get('content', [])
        if content.get('type') == 'image'
    )

    print(f"Loaded presentation with {total_images} images")
    print(f"Starting server at http://localhost:{args.port}")
    print("Press Ctrl+C to stop\n")

    # Start server
    server = HTTPServer(('localhost', args.port), RequestHandler)

    # Open browser after short delay
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
