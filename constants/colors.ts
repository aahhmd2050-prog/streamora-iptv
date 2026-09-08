/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F6F4F2',
    tint: '#F04444',

    // Core surfaces
    background: '#0B0B0D',
    foreground: '#F6F4F2',

    // Cards / elevated surfaces
    card: '#171719',
    cardForeground: '#F6F4F2',

    // Primary action color (buttons, links, active states)
    primary: '#EF4444',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#242426',
    secondaryForeground: '#F6F4F2',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#222224',
    mutedForeground: '#A7A5A5',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#35181B',
    accentForeground: '#FF8A8A',

    // Destructive actions (delete, error states)
    destructive: '#FF5555',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#2B2B2E',
    input: '#343438',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
