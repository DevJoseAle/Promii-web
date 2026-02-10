# Design System - Promii Dashboard

## Direction
**Personality**: Sophistication & Trust
**Foundation**: Cool tones (Blue primary)
**Depth**: Layered borders + subtle shadows
**Target**: B2B Merchants Dashboard

## Tokens

### Spacing
**Base**: 4px
**Scale**: 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
**Usage**: Consistent spacing using Tailwind's gap/space utilities

### Colors
```typescript
Primary:
  main: #2d68e8 (Brand blue)
  light: #4f86ff (Hover states)
  lighter: #e8f0ff (Backgrounds, badges)
  dark: #1a4bc4 (Pressed states)
  darker: #0d2d7a (Headers)

Success:
  main: #10b981 (Active promiis, success states)
  lighter: #d1fae5 (Success backgrounds)

Warning:
  main: #f59e0b (Pending states, warnings)
  lighter: #fef3c7 (Warning backgrounds)

Error:
  main: #ef4444 (Errors, validation)
  lighter: #fee2e2 (Error backgrounds)
  dark: #dc2626 (Error text)

Neutrals:
  50-900: Gray scale for text/borders

Background:
  primary: #ffffff (Cards, surfaces)
  secondary: #f9fafb (Page background)
  tertiary: #f3f4f6 (Input backgrounds)

Border:
  light: #e5e7eb (Subtle dividers)
  main: #d1d5db (Normal borders)

Text:
  primary: #111827 (Headings, labels)
  secondary: #6b7280 (Body text)
  tertiary: #9ca3af (Hints, disabled)
```

### Typography
- **Headings**: font-bold, tracking-tight
- **Labels**: font-semibold, text-sm
- **Body**: text-sm, leading-relaxed
- **Hints**: text-xs, tertiary color

## Patterns

### Section Card
```tsx
<div className="rounded-xl border p-6 shadow-sm"
  style={{
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.border.light,
  }}>
```
**Usage**: Main content sections in forms

### Section Header
```tsx
<SectionHeader
  icon={<svg>...</svg>}
  title="Section Title"
  description="Section description"
/>
```
**Anatomy**:
- Icon circle: 40px, primary.lighter background
- Title: text-lg font-bold
- Description: text-sm secondary color
- Bottom border: 1px solid border.light

### Field Component
```tsx
<Field label="Label" hint="Optional hint" error={error} required>
  <Input />
</Field>
```
**Anatomy**:
- Label: font-semibold, text-sm
- Required indicator: red asterisk (*)
- Hint: text-xs, tertiary color, right-aligned
- Error: red text with icon, below input
- Spacing: space-y-2

### Input States
**Default**:
- Height: h-10 (40px) for inputs, h-11 (44px) for buttons
- Border: border.main
- Background: background.tertiary
- Padding: px-4 py-3

**Focus**:
- Border: primary.main
- Ring: 3px primary.lighter

**Error**:
- Border: error.main
- Text color: error.dark

**Disabled**:
- Opacity: 50%
- Cursor: not-allowed

### Buttons

**Primary**:
- Height: h-11 (44px)
- Gradient: primary.main → primary.light (135deg)
- Font: font-semibold
- Hover: scale-105 + shadow-md
- Icon + text layout

**Secondary (Outline)**:
- Height: h-11
- Border: border.main
- Color: text.secondary
- Hover: scale-105

### Alerts/Banners

**Error**:
- Background: error.lighter
- Border: error.light
- Icon: error circle with X
- Text: error.dark

**Warning**:
- Background: warning.lighter
- Border: warning.light
- Icon: triangle with !
- Text: warning.dark

**Success**:
- Background: success.lighter
- Border: success.light
- Icon: check circle
- Text: success.dark

### Sidebar (Desktop)

**Container**:
- Width: 280px (collapsed: 76px)
- Background: background.primary
- Border-right: border.light
- Shadow: shadow-lg

**Nav Item (Active)**:
- Gradient background: primary.main → primary.light
- White text
- Left indicator bar: 1px, primary.dark
- Icon scale-110 on hover

**Nav Item (Inactive)**:
- Text: gray-700
- Hover: gray-50 background
- Icon: gray-600

### Bottom Tab Bar (Mobile)

**Container**:
- Fixed bottom, full width
- Background: background.primary with blur
- Border-top: border.light
- Shadow: subtle top shadow
- Padding: py-2

**Tab Item**:
- Layout: flex-col, icon + label
- Icon: size-6
- Label: text-xs
- Active: primary.main color + font-bold
- Badge: red dot for notifications

### Grid System

**Form Layouts**:
- Main: `lg:grid-cols-[1fr_340px]` (form + sidebar)
- Fields: `sm:grid-cols-2` or `sm:grid-cols-3`
- Gap: gap-4 (fields), gap-5 (sections), gap-6 (major)

### Responsive Breakpoints

- **sm**: 640px (tablet portrait)
- **lg**: 1024px (desktop) - sidebar appears, bottom bar hides

## Mobile-First Principles

1. **Bottom Navigation**: Primary actions at thumb-reach
2. **Sticky Footer**: Action buttons fixed at bottom with backdrop-blur
3. **Collapsible Sections**: Progressive disclosure for long forms
4. **Touch Targets**: Minimum 44px height for interactive elements
5. **Reduced Motion**: Prefer subtle scale transforms over complex animations

## Consistency Rules

1. **Spacing**: Always use multiples of 4px
2. **Borders**: Always use COLORS.border.light/main, never hardcoded
3. **Shadows**: shadow-sm (subtle) or shadow-lg (elevated), never custom
4. **Icons**: size-5 (20px) for UI, size-4 (16px) for inline
5. **Transitions**: transition-all duration-200 for micro-interactions
6. **Hover States**: scale-105 for buttons, scale-110 for icons
7. **Focus States**: Always include ring with primary.lighter color

## Component Checklist

Before creating a new component, check:
- [ ] Uses COLORS tokens (never hardcoded colors)
- [ ] Has hover/focus/disabled states
- [ ] Mobile-responsive (stacks vertically on small screens)
- [ ] Consistent spacing (gap-*, space-y-*)
- [ ] Proper semantic HTML (button, label, etc.)
- [ ] Accessible (ARIA labels where needed)
- [ ] Icons from consistent set (heroicons stroke)

## Notes

- **Gradients**: Reserved for primary actions and active states
- **Animations**: Kept minimal - scale and opacity only
- **Depth Strategy**: Borders + subtle shadows (never deep shadows)
- **Icon Style**: Outlined (stroke) for UI, filled for status indicators
- **Typography Hierarchy**: Clear via size, weight, and color (not decoration)
