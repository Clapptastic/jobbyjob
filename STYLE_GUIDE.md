# JobbyJob Style Guide 🎨

## Design System Overview

JobbyJob follows a modern, professional design system with a focus on clarity, accessibility, and user experience. The design language emphasizes professionalism while maintaining a contemporary tech-forward aesthetic.

## Color Palette

### Primary Colors
```css
:root {
  /* Brand Colors */
  --color-primary: #4F46E5;    /* Primary actions, links */
  --color-secondary: #10B981;  /* Success, positive actions */
  --color-accent: #8B5CF6;     /* Highlights, accents */
  
  /* Neutral Colors */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;
  
  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

### Color Usage
- Primary: Main actions, navigation, links
- Secondary: Success states, positive actions
- Accent: Highlights, secondary actions
- Grays: Text, backgrounds, borders
- Semantic: Status indicators, alerts

## Typography

### Font Families
```css
/* Headings */
font-family: 'Inter', -apple-system, sans-serif;

/* Body Text */
font-family: 'Inter', system-ui, sans-serif;

/* Monospace */
font-family: 'JetBrains Mono', ui-monospace, monospace;
```

### Font Sizes
```css
/* Headings */
h1: text-4xl (2.25rem)  /* Page titles */
h2: text-3xl (1.875rem) /* Section headers */
h3: text-2xl (1.5rem)   /* Subsection headers */
h4: text-xl (1.25rem)   /* Card headers */

/* Body */
text-base: 1rem         /* Default body text */
text-sm: 0.875rem       /* Secondary text */
text-xs: 0.75rem        /* Labels, captions */

/* Line Heights */
leading-none: 1         /* Headings */
leading-normal: 1.5     /* Body text */
leading-relaxed: 1.625  /* Large blocks of text */
```

## Components

### 1. Buttons
```jsx
/* Primary Button */
<button className="
  px-4 py-2
  bg-primary
  text-white
  font-medium
  rounded-lg
  hover:bg-primary-dark
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  transition-colors
">
  Primary Action
</button>

/* Secondary Button */
<button className="
  px-4 py-2
  border border-gray-300
  text-gray-700
  font-medium
  rounded-lg
  hover:bg-gray-50
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  transition-colors
">
  Secondary Action
</button>

/* Danger Button */
<button className="
  px-4 py-2
  bg-error
  text-white
  font-medium
  rounded-lg
  hover:bg-error-dark
  focus:ring-2 focus:ring-error focus:ring-offset-2
  transition-colors
">
  Danger Action
</button>
```

### 2. Form Elements
```jsx
/* Input Field */
<input
  className="
    w-full
    px-3 py-2
    border border-gray-300
    rounded-lg
    text-gray-900
    placeholder-gray-500
    focus:ring-2 focus:ring-primary focus:border-primary
    transition-colors
  "
  placeholder="Enter text"
/>

/* Select Field */
<select className="
  w-full
  px-3 py-2
  border border-gray-300
  rounded-lg
  text-gray-900
  focus:ring-2 focus:ring-primary focus:border-primary
  transition-colors
">
  <option>Select option</option>
</select>

/* Checkbox */
<label className="flex items-center space-x-2">
  <input
    type="checkbox"
    className="
      w-4 h-4
      text-primary
      border-gray-300
      rounded
      focus:ring-primary
    "
  />
  <span className="text-gray-700">Checkbox label</span>
</label>
```

### 3. Cards
```jsx
/* Basic Card */
<div className="
  bg-white
  rounded-xl
  shadow-sm
  border border-gray-200
  overflow-hidden
">
  <div className="p-6">
    <h3 className="text-xl font-semibold text-gray-900">Card Title</h3>
    <p className="mt-2 text-gray-600">Card content goes here.</p>
  </div>
</div>

/* Interactive Card */
<div className="
  bg-white
  rounded-xl
  shadow-sm
  border border-gray-200
  hover:shadow-md
  transition-shadow
  cursor-pointer
">
  {/* Card content */}
</div>
```

### 4. Navigation
```jsx
/* Navigation Link */
<a className="
  text-gray-600
  hover:text-gray-900
  font-medium
  transition-colors
">
  Nav Item
</a>

/* Active Navigation Link */
<a className="
  text-primary
  font-medium
  border-b-2 border-primary
">
  Active Item
</a>
```

## Layout

### 1. Spacing Scale
```css
/* Consistent spacing units */
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-3: 0.75rem (12px)
space-4: 1rem (16px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
space-12: 3rem (48px)
space-16: 4rem (64px)
```

### 2. Container Widths
```css
max-w-screen-sm: 640px
max-w-screen-md: 768px
max-w-screen-lg: 1024px
max-w-screen-xl: 1280px
max-w-screen-2xl: 1536px
```

### 3. Grid System
```jsx
/* Basic Grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

/* Dashboard Layout */
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 lg:col-span-8">
    {/* Main content */}
  </div>
  <div className="col-span-12 lg:col-span-4">
    {/* Sidebar */}
  </div>
</div>
```

## Animations

### 1. Transitions
```css
/* Default Transitions */
transition-all: 150ms ease-in-out
transition-colors: 150ms ease-in-out
transition-transform: 150ms ease-in-out
transition-opacity: 150ms ease-in-out
```

### 2. Loading States
```jsx
/* Spinner */
<div className="animate-spin h-5 w-5 text-primary">
  {/* Spinner SVG */}
</div>

/* Skeleton Loading */
<div className="
  animate-pulse
  bg-gray-200
  rounded-lg
  h-4
"></div>
```

## Responsive Design

### 1. Breakpoints
```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### 2. Mobile-First Approach
- Design for mobile first
- Add complexity for larger screens
- Use responsive utilities consistently
- Ensure touch targets are at least 44px

## Accessibility

### 1. Color Contrast
- Maintain WCAG 2.1 AA standard
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text

### 2. Focus States
```css
/* Focus Ring */
focus:ring-2
focus:ring-primary
focus:ring-offset-2
focus:outline-none
```

### 3. Screen Reader Support
```jsx
/* Hidden Text */
<span className="sr-only">
  Screen reader text
</span>

/* Skip Link */
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Best Practices

### 1. Component Design
- Use semantic HTML
- Maintain consistent spacing
- Follow accessibility guidelines
- Use proper heading hierarchy

### 2. Responsive Design
- Mobile-first approach
- Fluid typography
- Flexible layouts
- Touch-friendly targets

### 3. Performance
- Optimize images
- Minimize layout shifts
- Use system fonts
- Efficient animations

### 4. Accessibility
- Keyboard navigation
- Screen reader support
- Sufficient color contrast
- Clear focus states 