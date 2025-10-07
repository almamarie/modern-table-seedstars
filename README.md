# Modern Table Application

A responsive, feature-rich table application built with React, TypeScript, and TanStack Table. This project demonstrates advanced table functionality including sorting, column reordering, row selection, bulk actions, and responsive design.

## 🎥 Demo Video

👉 [Watch the 2-minute demo here](https://drive.google.com/file/d/1lFv_THiMUHRcQD2x7TSvnJtTNEKxzhRe/view?usp=sharing)

*(Shows table reordering, sorting, selection, and bulk actions with explanations.)*

## 🔗 Live Demo

Try the live demo here: **[Modern Table — Live Demo](https://modern-table-seedstars-8w9w.vercel.app/)**

[![View demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=flat&logo=react)](https://your-live-url.com)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

```bash
# Clone the repository
git clone git@github.com:almamarie/modern-table-seedstars.git
cd mordern-table-seedstars

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# tests
npx vitest
```

The application will be available at `http://localhost:5173` (or next available port).

## 📱 Features

### Core Table Features

- **Sortable Columns**: Click column headers to sort data (ascending/descending)
- **Column Reordering**: Drag the 🟰 handle to reorder columns
- **Row Selection**: Select individual rows or all rows with checkboxes
- **Bulk Actions**: Accept/Decline multiple selected applications
- **Pagination**: Navigate through data with page controls
- **Persistent Column Order**: Column arrangements saved to localStorage

### Responsive Design

- **Mobile (< 768px)**: Shows informative message encouraging desktop/tablet use
- **Tablet (768px - 1024px)**: Optimized layout with adjusted spacing and vertical pagination
- **Desktop (≥ 1024px)**: Full-featured experience with horizontal pagination

### Data Features

- **Mock Data**: 200 generated user applications with realistic data
- **Client-side Sorting**: Fast in-memory sorting for loaded data
- **Infinite Query Pattern**: Prepared for server-side pagination (currently mocked)

## 🏗️ Architecture & Design Decisions

### Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **TanStack Table v8** - Powerful headless table library
- **TanStack Query** - Data fetching and caching (infinite queries)
- **Tailwind CSS** - Utility-first styling with responsive design
- **@dnd-kit** - Modern drag-and-drop for column reordering
- **Vite** - Fast development and build tooling

### Key Design Decisions

#### 1. **Headless UI Pattern**

- Used TanStack Table as headless component for maximum flexibility
- Custom table components in `components/ui/table.tsx`
- Separation of data logic from presentation

#### 2. **Component Architecture**

```
src/
├── components/
│   ├── ui/           # Reusable UI components (table, buttons, etc.)
│   ├── Actions.tsx   # Row-level action buttons
│   ├── ApplicationStatus.tsx  # Status badge component
│   └── SortableHeader.tsx    # Interactive column headers
├── pages/
│   ├── ModernTable.tsx       # Main table (non-virtualized)
│   └── VirtualizedModernTable.tsx  # Virtualized version
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

#### 3. **State Management**

- **Local State**: React useState for component-specific state
- **Persistent State**: localStorage for column order preferences
- **Server State**: TanStack Query for data fetching and caching
- **Table State**: TanStack Table's built-in state management

#### 4. **Responsive Strategy**

- **CSS-First Approach**: Tailwind responsive utilities (`md:`, `lg:`)
- **JavaScript Enhancement**: Custom `useResponsive` hook for complex logic
- **Progressive Enhancement**: Core functionality works on all screens

#### 5. **Drag & Drop Implementation**

- **Separated Concerns**: Drag handles separate from sort buttons
- **Selective Dragging**: `disableDrag` flag prevents reordering of system columns
- **Visual Feedback**: Clear drag handles (🟰) with hover states

#### 6. **Type Safety**

- **Strict TypeScript**: Full type coverage for table data and configurations
- **Generic Components**: Type-safe reusable table components
- **Custom Types**: Domain-specific types for Person, Status, etc.

## 🎯 Key Components

### ModernTable vs VirtualizedModernTable

- **ModernTable**: Standard table for moderate datasets (< 1000 rows)
- **VirtualizedModernTable**: Optimized for large datasets (1000+ rows)
- **Shared Components**: Both use the same UI components and hooks

### DataTable Component

- Headless table wrapper with drag-and-drop integration
- Handles column reordering, sorting, and pagination
- Responsive container with proper width calculations

### Column Configuration

```typescript
{
  accessorKey: "status",
  header: ({ column }) => <SortableHeader column={column} title="Status" />,
  cell: (info) => <ApplicationStatus status={info.getValue() as STATUS} />,
  disableDrag: true,  // Prevents column reordering
  enableSorting: true // Enables column sorting
}
```

## ⚠️ Known Limitations & Trade-offs

### Performance Considerations

1. **Client-side Sorting**:

   - **Pro**: Fast for loaded data, good UX
   - **Con**: Limited by browser memory, doesn't scale to massive datasets
   - **Mitigation**: VirtualizedModernTable available for large datasets
2. **Non-virtualized Rendering**:

   - **Pro**: Simple implementation, better for moderate data sizes
   - **Con**: Performance degradation with 1000+ rows
   - **Trade-off**: Chose simplicity over virtualization complexity for main table

### Browser Compatibility

1. **Modern Browser Features**:
   - **Requirement**: ES2020+ features, CSS Grid, Flexbox
   - **Limitation**: No IE11 support
   - **Trade-off**: Modern development experience vs legacy support

### Responsive Design

1. **Mobile Experience**:
   - **Decision**: Show message instead of cramped table
   - **Pro**: Clear UX, encourages proper screen size usage
   - **Con**: No mobile table functionality

### Data Management

1. **Mock Data Only**:

   - **Current**: Faker.js generated data with simulated API
   - **Limitation**: No real backend integration
   - **Ready for**: Server-side pagination, filtering, sorting
2. **localStorage Persistence**:

   - **Pro**: Instant column order saving
   - **Con**: Limited to single browser/device
   - **Enhancement**: Could integrate with user accounts for cross-device sync

### Accessibility

1. **Keyboard Navigation**:

   - **Covered**: Basic table navigation, button interactions
   - **Missing**: Advanced keyboard shortcuts for power users
2. **Screen Readers**:

   - **Covered**: Semantic HTML, ARIA attributes on interactive elements
   - **Enhancement**: More detailed sorting state announcements

## 🔧 Configuration Options

### Environment Variables

```bash
# None currently required - all configuration is code-based
```

### Customizable Settings

```typescript
// Fetch size (number of records per page)
const fetchSize = 200;

// Responsive breakpoints (in useResponsive hook)
const breakpoints = {
  mobile: 768,
  tablet: 1024
};

// Column order persistence key
const COLUMN_ORDER_KEY = 'table-column-order';
```

## 🚧 Future Enhancements

### High Priority

- [ ] Server-side integration (sorting, filtering, pagination)
- [ ] Advanced filtering UI
- [ ] Export functionality (CSV, Excel)
- [ ] Column visibility toggle

### Medium Priority

- [ ] Keyboard shortcuts for power users
- [ ] Column resizing
- [ ] Row grouping/aggregation
- [ ] Dark mode support

### Low Priority

- [ ] Mobile-optimized card layout
- [ ] Advanced accessibility features
- [ ] Column-specific search
- [ ] Custom column templates

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Tailwind for styling (avoid custom CSS)
3. Maintain responsive design patterns
4. Add proper error handling
5. Include console logging for debugging
