# Changelog

All notable changes to PPT2HandoutSkill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **categorize-from-descriptions.py** - New script for local image categorization
  - Uses keyword matching on existing descriptions
  - No API calls required - runs entirely locally
  - Useful when descriptions exist but categories are missing
  - Pattern-based detection for 12 categories
- **categorize-presentation-images.py** - Alternative local categorization script
  - Categorizes images based on existing descriptions
  - Keyword matching for all 12 image categories
  - No API costs - pure local processing
  - Useful fallback when API analysis is unavailable
- **HomePage Index & Glossary Preview** - New section showing resource examples
  - Displays sample people, quotes, tools, terms, and dates
  - Links to full Resources page
  - Improves discoverability of extracted entities

### Changed
- **analyze-existing-images.py** - Updated to use Gemini 3 Flash Preview
  - Switched from deprecated `google.generativeai` to `google-genai` package
  - Uses `gemini-3-flash-preview` model (NOT gemini-2.0)
  - Updated API calls to match new package structure
  - Improved error handling and token tracking
- **processMedia.js** - Now preserves AI-generated category field
  - Added `category` to preserved image fields during build
  - Prevents category data loss during media processing
  - Categories now persist from analysis through to deployment
- **MediaGalleryPage.tsx** improvements
  - Reads descriptions and categories directly from presentation.json
  - Removed unnecessary entities.json lookup for image metadata
  - Fixed TypeScript errors with unused imports
  - Removed "Key Images" section
  - Added "With Description" filter button
  - Changed large key badge to small ✨ icon for images with descriptions
  - Category badge now shown separately alongside description icon
- **HomePage.tsx** - Redesigned for better content hierarchy
  - Abstract now prominent at top with accent-colored border
  - Key topics displayed in larger, more visible card
  - New Index & Glossary Preview section replaces Resources section
  - Shows examples from extracted entities with "View Full Index" link
  - Session details moved to bottom for cleaner layout
- **Skill documentation** extensively updated
  - **User Interaction Philosophy** section added
    - "ASK, don't assume" - confirm before significant decisions
    - "Show, then ask" - present results before proceeding
    - "Never deploy without explicit user approval"
    - Regular check-ins after major steps
  - **Critical URL Extraction Guidance** added
    - Warning about URLs split across lines in presentations
    - Semantic understanding required (not regex-based extraction)
    - URL validation requirements before adding to entities
    - Examples of common URL splitting issues
  - **Gemini 3 Flash Preview Requirements** emphasized
    - MUST use `gemini-3-flash-preview` model
    - Use `google-genai` package (not `google.generativeai`)
    - Never use Gemini 2.0 models for this task
  - Added documentation for both image analysis scripts
  - Updated entities.json format with category field
  - Added processingStats.json to file structure

### Fixed
- **Image categories not visible** - MediaGalleryPage now correctly reads from presentation.json
- **URL splitting issues** - Skill now emphasizes semantic extraction over regex
  - Prevents false URLs like "ac.uk" from "user@example.ac.uk"
  - Prevents domain splits like "ltvibes.tech" + "czech.net" from "ltvibes.techczech.net"
- **Wrong Gemini model usage** - Documentation now clearly requires Gemini 3 Flash Preview

## [1.3.0] - 2026-01-15

### Added
- **Image categorization** - AI now classifies images into categories during analysis
  - Categories: cartoon, interface_screenshot, chat_screenshot, tweet, quote, academic_paper, diagram, chart, photo_person, book_cover, product_page, other
  - Category filter dropdown in Media Gallery page
  - Category badge displayed on each image in gallery
- **Processing statistics** - Track and display AI analysis metrics
  - New `processingStats.json` file generated after image analysis
  - Tracks: images processed, tokens used, category counts, processing duration
  - About page now displays AI processing stats when available
- **Token usage tracking** in analyze-existing-images.py script
  - Reports input/output/total tokens used during analysis
  - Displayed in terminal output and saved to stats file

### Changed
- **analyze-existing-images.py** significantly updated
  - Added image category classification to prompt
  - Added token tracking via response.usage_metadata
  - Generates `processingStats.json` with detailed metrics
  - Upgraded from Gemini 3 Flash Preview to Gemini 2.0 Flash
  - Category breakdown shown in terminal output
- **MediaGalleryPage.tsx** enhanced
  - Added category filter dropdown (only shows when categories exist)
  - Category badge on image cards replacing generic "Key" badge
  - Updated filtering logic to support combined type + category filtering
- **AboutPage.tsx** enhanced
  - New "AI Image Analysis" section (conditional on stats file existing)
  - Shows images analyzed, tokens used, categories detected
  - Category breakdown with counts

### Documentation
- Updated skill to document new image categorization feature
- Added processingStats.json to file structure documentation

## [1.2.0] - 2026-01-14

### Added
- **AI-driven entity extraction** replacing mechanical regex-based extraction
  - New `entities.json` file generated by AI during skill execution
  - Properly identifies people, quotes, organizations, tools, terms, and dates
  - AI model understands context (e.g., distinguishes real quotes from random image text)
  - Key images get rich descriptions with context (source, date, type of content)
- **New workflow step: "Analyze Content for Entities"** (Step 4)
  - AI reads presentation.json and creates entities.json with semantic understanding
  - Detailed instructions for identifying each entity type
  - JSON format specification for entities.json

### Changed
- **extractResources.ts** completely rewritten
  - Now reads from `entities.json` instead of using regex patterns
  - Removed hardcoded `KNOWN_TOOLS`, `KNOWN_ORGANIZATIONS`, `KNOWN_PLACES` lists
  - Removed regex patterns for quotes, dates, people
  - Keeps mechanical URL extraction (URLs are unambiguous)
  - Much simpler and more maintainable code
- **Skill workflow** updated with new step numbering
  - Step 4: Analyze Content for Entities (new)
  - Step 5: Generate sessionInfo.ts (was Step 4)
  - Step 6: Process Media (was Step 5)
  - Step 7: Preview and Review (was Step 6)
  - Step 8: Deploy (was Step 7)
- **File structure** documentation updated
  - Added `entities.json` to src/data/
  - Added `extractResources.ts` under src/utils/

### Fixed
- **False positive quotes** - Previously showed 115+ "quotes" that were just random text in images; now shows only actual attributed quotes
- **Missing people** - Previously identified only 1 person via regex; now AI finds all people mentioned (24 in test presentation)
- **Poor image context** - Tweets now described as "Tweet by X on Y date" instead of just the text content

### Removed
- Hardcoded entity lists from extractResources.ts (now AI-driven)
- Regex-based quote detection (unreliable)
- Pattern-based people/organization extraction

## [1.1.0] - 2026-01-14

### Added
- **Automatic video compression** for videos exceeding 25MB file size limit
  - Uses ffmpeg to compress videos during build process
  - Automatically calculates optimal bitrate based on video duration and target size
  - Compresses to 24MB (with headroom) to fit Cloudflare Pages' 25MB limit
  - Gracefully falls back if ffmpeg is not installed (logs warning)
  - Logs compression progress and final file sizes
- **Improved skill workflow** to reduce back-and-forth with users
  - New Step 1: Gather key information upfront before starting work
  - Collects project name, presentation title, presenter name/link, input type, and deployment target
  - Uses AskUserQuestion tool for efficient information gathering
  - Deployment target question optimizes for platform-specific constraints
- **ffmpeg requirement** added to documentation
  - Installation instructions for macOS, Linux, and Windows
  - Marked as optional but recommended for Cloudflare Pages deployment
  - Added to README requirements section
  - Added to skill requirements section

### Changed
- **processMedia.js** now includes video compression logic
  - Imports `execSync` from `child_process` for ffmpeg commands
  - New functions: `hasFFmpeg()`, `getVideoInfo()`, `compressVideo()`
  - Modified media processing loop to check video sizes and compress when needed
  - Enhanced logging to show compression status and video counts
- **Build process** now includes video compression step
  - Updated README build process documentation
  - Added note about automatic compression when deploying to Cloudflare Pages
- **Skill workflow** restructured for better efficiency
  - Step 1 now focuses on upfront information gathering
  - Step 3 added for optional content review
  - Step 4 updated to use information from Step 1
  - Step 5 documents automatic video compression behavior

### Fixed
- Cloudflare Pages deployment failures due to videos exceeding 25MB limit
  - Videos are now automatically compressed during build
  - Prevents deployment errors and manual compression steps

### Documentation
- Updated README.md with video compression feature
- Added "Automatic video compression" to features list
- Updated build process to mention compression step
- Added ffmpeg to requirements with installation instructions
- Added troubleshooting section for large video deployment issues
- Updated skill documentation (.claude/skills/pptx-to-handout.md)
- Added workflow improvements and compression documentation

## [1.0.0] - 2026-01-13

### Added
- Initial release of PPT2HandoutSkill
- PowerPoint to interactive React handout website conversion
- Python-based PPTX extraction script
- Interactive slide viewer with keyboard navigation
- Search functionality across all content
- Media gallery for browsing images and videos
- Automatic resource extraction from slides
- Responsive design for mobile and desktop
- Support for multiple content types (text, images, SmartArt, videos)
- Section-based navigation
- Claude Code skill for guided setup
- Deployment support for Vercel and Cloudflare Pages
- Customizable colors and fonts
- TypeScript support with strict type checking

[Unreleased]: https://github.com/techczech/PPT2HandoutSkill/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/techczech/PPT2HandoutSkill/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/techczech/PPT2HandoutSkill/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/techczech/PPT2HandoutSkill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/techczech/PPT2HandoutSkill/releases/tag/v1.0.0
