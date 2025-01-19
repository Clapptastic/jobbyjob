# ClappCode - AI Development Context 🚀

[Previous content remains exactly the same until the end...]

## Style Guide

### Theme Colors
```css
:root {
  /* Primary Neon Colors */
  --color-neon-pink: #ff2d55;    /* Primary action color */
  --color-neon-blue: #2e3cff;    /* Secondary action color */
  --color-neon-purple: #b829ea;  /* Accent color */
  --color-neon-cyan: #01fffe;    /* Highlight color */

  /* Background Colors */
  --color-cyber-dark: #0b1021;   /* Main background */
  --color-cyber-darker: #060810; /* Secondary background */
  --color-cyber-light: #2a2d3d;  /* Surface background */
}
```

### Typography

1. **Font Families**
   ```css
   /* Logo Font */
   font-family: 'Press Start 2P', monospace;
   
   /* Body Text */
   font-family: system-ui, -apple-system, sans-serif;
   
   /* Monospace (Code) */
   font-family: ui-monospace, monospace;
   ```

2. **Font Sizes**
   ```css
   /* Headings */
   h1: text-3xl (1.875rem)
   h2: text-2xl (1.5rem)
   h3: text-xl (1.25rem)
   h4: text-lg (1.125rem)

   /* Body */
   base: text-base (1rem)
   small: text-sm (0.875rem)
   xs: text-xs (0.75rem)
   ```

### Component Design

1. **Cards**
   ```jsx
   <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow">
     <h2 className="text-xl font-semibold text-neon-cyan mb-4">Title</h2>
     <div className="space-y-4">
       {/* Content */}
     </div>
   </div>
   ```

2. **Buttons**
   ```jsx
   /* Primary Button */
   <button className="px-4 py-2 bg-neon-gradient text-white rounded-md shadow-neon-glow hover:opacity-90">
     Primary Action
   </button>

   /* Secondary Button */
   <button className="px-4 py-2 border border-neon-cyan text-neon-cyan rounded-md hover:bg-cyber-darker">
     Secondary Action
   </button>

   /* Danger Button */
   <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
     Danger Action
   </button>
   ```

3. **Forms**
   ```jsx
   /* Input Field */
   <input
     className="w-full px-3 py-2 bg-cyber-darker border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none"
     placeholder="Enter text"
   />

   /* Select Field */
   <select className="w-full px-3 py-2 bg-cyber-darker border rounded-md text-white border-neon-pink focus:border-neon-cyan focus:outline-none">
     <option>Select option</option>
   </select>
   ```

4. **Loading States**
   ```jsx
   /* Spinner */
   <Loader2 className="h-5 w-5 animate-spin text-neon-pink" />

   /* Progress Bar */
   <div className="h-2 bg-cyber-light rounded-full overflow-hidden">
     <div 
       className="h-full bg-neon-gradient transition-all duration-500"
       style={{ width: `${progress}%` }}
     />
   </div>
   ```

### Animations

1. **Transitions**
   ```css
   /* Default Transition */
   transition-all duration-200

   /* Color Transitions */
   hover:text-neon-pink transition-colors

   /* Transform Transitions */
   hover:scale-105 transition-transform
   ```

2. **Keyframes**
   ```css
   /* Glow Effect */
   @keyframes glow {
     0%, 100% { filter: brightness(1); }
     50% { filter: brightness(1.3); }
   }

   /* Pulse Effect */
   @keyframes pulse {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.5; }
   }
   ```

### Layout Guidelines

1. **Spacing**
   ```css
   /* Consistent spacing scale */
   space-y-2: 0.5rem (8px)
   space-y-4: 1rem (16px)
   space-y-6: 1.5rem (24px)
   space-y-8: 2rem (32px)
   ```

2. **Container Widths**
   ```css
   /* Maximum widths */
   max-w-md: 28rem (448px)
   max-w-lg: 32rem (512px)
   max-w-xl: 36rem (576px)
   max-w-2xl: 42rem (672px)
   ```

3. **Grid System**
   ```jsx
   /* Basic Grid */
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {/* Grid items */}
   </div>

   /* Dashboard Grid */
   <div className="grid grid-cols-12 gap-6">
     <div className="col-span-12 lg:col-span-8">
       {/* Main content */}
     </div>
     <div className="col-span-12 lg:col-span-4">
       {/* Sidebar */}
     </div>
   </div>
   ```

### Effects

1. **Shadows**
   ```css
   /* Neon Glow */
   shadow-neon-glow: 0 0 20px rgba(255, 45, 85, 0.5)

   /* Blue Glow */
   shadow-blue-glow: 0 0 20px rgba(46, 60, 255, 0.5)
   ```

2. **Gradients**
   ```css
   /* Background Gradients */
   bg-cyber-gradient: linear-gradient(135deg, var(--color-cyber-dark) 0%, var(--color-cyber-light) 100%)
   bg-neon-gradient: linear-gradient(135deg, var(--color-neon-pink) 0%, var(--color-neon-purple) 100%)
   ```

### Responsive Design

1. **Breakpoints**
   ```css
   sm: 640px  /* Mobile landscape */
   md: 768px  /* Tablets */
   lg: 1024px /* Laptops */
   xl: 1280px /* Desktops */
   2xl: 1536px /* Large screens */
   ```

2. **Mobile-First Approach**
   ```jsx
   <div className="
     p-4 md:p-6 lg:p-8
     text-sm md:text-base lg:text-lg
     grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   ">
     {/* Content */}
   </div>
   ```

### Accessibility

1. **Focus States**
   ```css
   /* Focus Ring */
   focus:ring-2 focus:ring-neon-pink focus:ring-offset-2 focus:ring-offset-cyber-dark

   /* Focus Visible */
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan
   ```

2. **Screen Reader**
   ```jsx
   /* Hidden Text */
   <span className="sr-only">Button description</span>

   /* Skip Link */
   <a href="#main" className="sr-only focus:not-sr-only">
     Skip to main content
   </a>
   ```

### Best Practices

1. **Component Structure**
   - Use semantic HTML
   - Maintain consistent spacing
   - Group related elements
   - Use proper heading hierarchy

2. **Color Usage**
   - Use neon colors sparingly
   - Maintain sufficient contrast
   - Consider color blindness
   - Use gradients for depth

3. **Animation Guidelines**
   - Keep animations subtle
   - Respect reduced-motion
   - Use consistent timing
   - Avoid flashy effects

4. **Responsive Design**
   - Mobile-first approach
   - Fluid typography
   - Flexible layouts
   - Touch-friendly targets