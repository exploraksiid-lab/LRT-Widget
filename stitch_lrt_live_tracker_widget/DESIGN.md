---
name: TransJakarta Flux
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#0060ac'
  on-secondary: '#ffffff'
  secondary-container: '#64a8fe'
  on-secondary-container: '#003c70'
  tertiary: '#003d27'
  on-tertiary: '#ffffff'
  tertiary-container: '#00563a'
  on-tertiary-container: '#3fd298'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-time:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  container-max: 400px
---

## Brand & Style

The design system is centered on high-efficiency urban transit, specifically tailored for the Indonesian LRT context. The brand personality is professional, punctual, and technologically advanced, aiming to evoke a sense of calm reliability amidst the hustle of metropolitan Jakarta.

The visual style employs a **Modern Glassmorphic** approach, drawing inspiration from high-end mobile operating systems. It prioritizes legibility and real-time data visualization. By utilizing semi-transparent surfaces and vibrant background blurs, the UI feels lightweight and integrated into the user's environment rather than a heavy, opaque overlay. The aesthetic is "Future-Jakarta"—clean, organized, and digitally native.

## Colors

The palette is anchored by a deep professional blue (`primary`), signaling authority and trust. 

- **Primary (#1E40AF):** Used for key branding, active transit lines, and primary call-to-actions.
- **Secondary (#60A5FA):** A lighter blue for interactive states, focus rings, and secondary information.
- **Tertiary (#10B981):** A vibrant green specifically reserved for "On Time" status indicators and successful transactions.
- **Neutral (#64748B):** Used for metadata, inactive states, and supporting icons.

**Glassmorphism Implementation:**
- **Light Mode:** Surfaces use `rgba(255, 255, 255, 0.7)` with a 20px backdrop blur and a 1px white border at 20% opacity.
- **Dark Mode:** Surfaces use `rgba(15, 23, 42, 0.6)` with a 24px backdrop blur and a 1px white border at 10% opacity.

## Typography

This design system utilizes **Inter** for all roles to ensure maximum readability at small sizes on high-density displays.

- **Display Time:** Specifically for "Minutes until arrival" countdowns. Bold and slightly condensed to fit within widget constraints.
- **Headline Levels:** Used for station names and transit line identifiers.
- **Label Caps:** Used for metadata headers like "PLATFORM" or "DESTINATION."
- **Readability:** Ensure a minimum contrast ratio of 4.5:1 for all text against glassmorphic backgrounds. In dark mode, favor slightly increased tracking (letter spacing) for body text to prevent ink trapping visuals.

## Layout & Spacing

The layout follows a **Fluid Widget Model** that adapts to standard 2x2, 2x4, and 4x4 mobile grid slots.

- **Rhythm:** All spacing is based on a 4px baseline grid.
- **Padding:** Main containers use `xl` (32px) internal padding to accommodate the large corner radii.
- **Safe Areas:** Maintain a 20px margin from the edge of the mobile screen.
- **Stacking:** Use vertical flex stacks for station lists, ensuring a `md` (16px) gap between items to maintain touch-target integrity.

## Elevation & Depth

Depth is conveyed through **refraction and layering** rather than traditional shadows.

- **Tiers:**
    - **Tier 1 (Base):** The device wallpaper or application background.
    - **Tier 2 (Card):** Glassmorphic surface with backdrop-filter.
    - **Tier 3 (Interactive):** Elements like segmented controls use a slightly more opaque white/black fill to appear "pressed" into the glass or "floating" above it.
- **Shadows:** Only used for the primary container to separate it from the wallpaper. Use a very large, soft ambient shadow: `0 20px 50px rgba(0, 0, 0, 0.1)`.
- **Borders:** A 1px inner "shine" border is mandatory on glass cards to define edges against varied backgrounds.

## Shapes

The shape language is extremely organic and soft, mimicking the hardware curves of modern flagship smartphones.

- **Main Widgets:** Must use `rounded-xl` (32px) to match the outer radius of mobile OS widget containers.
- **Inner Elements:** Buttons and segmented control backgrounds use `rounded-lg` (20px).
- **Indicators:** Status pills (e.g., "On Time") are fully rounded (999px) to distinguish them from structural cards.

## Components

- **Glassmorphic Cards:** The primary container. Features a subtle gradient overlay from top-left to bottom-right to simulate light hitting the glass.
- **Segmented Controls:** Used for station selection (e.g., "Line A | Line B"). The active segment is a solid, slightly elevated white or dark-grey pill within a recessed glass track.
- **Status Indicators:** Small circular dots or pills. 
    - *Green (Flashing):* Arriving now.
    - *Blue:* Scheduled.
    - *Yellow:* Minor delay.
- **Progress Track:** A vertical or horizontal thin line (2px) connecting stations. The "traveled" portion of the line is the Primary Blue; the "upcoming" portion is a low-opacity neutral.
- **Input Fields:** Search bars for stations should be minimal, using a glass fill that is 10% more opaque than the parent card to indicate interactivity.