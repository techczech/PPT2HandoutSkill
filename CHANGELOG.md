# Changelog

All notable changes to PPT2HandoutSkill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/techczech/PPT2HandoutSkill/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/techczech/PPT2HandoutSkill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/techczech/PPT2HandoutSkill/releases/tag/v1.0.0
