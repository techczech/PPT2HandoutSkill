/**
 * Screenshot Mapping Utility
 *
 * Handles the mapping between slide numbers (from presentation content) and
 * screenshot file numbers. This is needed when slides are added to the content
 * data but don't have corresponding screenshots.
 *
 * How it works:
 * - slidesWithoutScreenshots: Array of slide numbers that exist in content but have no screenshot
 * - For any slide N, the screenshot number is N minus the count of missing slides before N
 */

// Slides that exist in the presentation content but don't have corresponding screenshot files
// Add slide numbers here (1-indexed) when screenshots are missing
export const slidesWithoutScreenshots: number[] = [];

/**
 * Calculate the screenshot file number for a given slide order
 * @param slideOrder The 1-indexed slide number from the presentation
 * @returns The screenshot file number to use, or null if this slide has no screenshot
 */
export function getScreenshotNumber(slideOrder: number): number | null {
  // Check if this specific slide is missing a screenshot
  if (slidesWithoutScreenshots.includes(slideOrder)) {
    return null;
  }

  // Count how many missing slides come before this one
  const missingBefore = slidesWithoutScreenshots.filter(s => s < slideOrder).length;

  // Subtract the count of missing slides to get the correct screenshot number
  return slideOrder - missingBefore;
}

/**
 * Get the full screenshot path for a slide
 * @param slideOrder The 1-indexed slide number from the presentation
 * @returns The screenshot path, or null if no screenshot exists
 */
export function getScreenshotPath(slideOrder: number): string | null {
  const screenshotNumber = getScreenshotNumber(slideOrder);
  if (screenshotNumber === null) {
    return null;
  }
  return `/assets/screenshots/screenshot_${screenshotNumber}.png`;
}

/**
 * Check if a slide has a screenshot available
 * @param slideOrder The 1-indexed slide number from the presentation
 */
export function hasScreenshot(slideOrder: number): boolean {
  return !slidesWithoutScreenshots.includes(slideOrder);
}
