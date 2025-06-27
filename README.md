# Daily Companion App

A React-based companion app designed to help autistic individuals with daily tasks and organization. This app provides a customizable dashboard with various helpful tools in an accessible, user-friendly interface.

## 🧭 Features

- **Customizable Grid Layout**: Organize your tools in a personalized dashboard
- **Tool Management**: Easily add or remove tools from your dashboard
- **Autism-Friendly Design**: Clear, simple interface with high contrast and consistent patterns
- **Local Storage**: Your data is saved locally on your device

## 🛠️ Available Tools

### Market List Maker 🛒
- Create and manage shopping lists
- Mark items as completed
- Edit items on the fly
- Clear completed items
- Track completion progress

### Medicine Reminder 💊
- Track medications and dosages
- Set frequency and preferred times
- Add notes for each medicine
- Mark medications as taken
- View last taken timestamps

### Notes Section 📝
- Create quick notes and reminders
- Categorize notes (Work, Personal, Health, etc.)
- Set priority levels (Low, Normal, Medium, High)
- Edit notes inline
- Track creation and update dates

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd companion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🎨 Design Principles

- **Accessibility First**: Designed with screen readers, keyboard navigation, and high contrast in mind
- **Clear Visual Hierarchy**: Consistent typography and spacing
- **Reduced Cognitive Load**: Simple, predictable interface patterns
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Sensory Considerations**: Minimal animations, optional dark mode support

## 🔧 Technical Stack

- **React**: Modern React with hooks for state management
- **Vite**: Fast development and build tooling
- **CSS Variables**: Consistent theming and easy customization
- **Local Storage**: Client-side data persistence
- **Semantic HTML**: Accessible markup structure

## 📱 Usage

1. **Getting Started**: Click "Add Tools" to select which tools you want on your dashboard
2. **Customizing**: Add or remove tools as needed - your preferences are automatically saved
3. **Using Tools**: Each tool is self-contained with its own features and data storage

## 🌟 Customization

The app uses CSS custom properties (variables) for easy theming. You can modify colors, spacing, and other design tokens in `src/App.css`.

## 🤝 Contributing

This is a personal project designed for specific accessibility needs. If you have suggestions or improvements, please feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💝 Acknowledgments

Built with love for the autism community, focusing on reducing daily stress and improving organization through technology.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
