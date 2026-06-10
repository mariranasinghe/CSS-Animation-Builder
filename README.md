# CSS Animation Builder

A web-based tool for creating, previewing, and exporting CSS animations with an easy-to-use interface.

## Overview

CSS Animation Builder helps developers and designers build CSS animations faster without writing every keyframe by hand. It is designed to make animation creation more visual, interactive, and easier to test in real time.

## Features

- Create custom CSS animations visually
- Preview animation behavior in real time
- Adjust timing, easing, delay, duration, and iteration settings
- Generate reusable CSS output
- Speed up frontend prototyping and UI experimentation

## Tech Stack

Update this section based on the project:

- HTML
- CSS
- JavaScript

Or, if applicable:

- React
- TypeScript
- Vite

## Getting Started

### Prerequisites

Make sure you have one of the following installed:

- A modern web browser
- Node.js and npm (if this project uses a frontend build tool)

### Installation

Clone the repository:

```bash
git clone https://github.com/mariranasinghe/CSS-Animation-Builder.git
cd CSS-Animation-Builder
```

If the project uses npm:

```bash
npm install
```

### Run Locally

If this is a static project, open `index.html` in your browser.

If this uses a dev server:

```bash
npm run dev
```

If this uses a production preview flow:

```bash
npm run build
npm run preview
```

## Usage

1. Open the application in your browser.
2. Choose or configure animation properties.
3. Preview the animation live.
4. Copy the generated CSS.
5. Paste the output into your own project.

## Example Output

```css
.animated-box {
  animation: fadeInUp 1s ease-in-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Project Structure

Update this section to match the actual repository layout:

```text
CSS-Animation-Builder/
├── public/
├── src/
│   ├── components/
│   ├── styles/
│   └── main.js
├── index.html
├── package.json
└── README.md
```

## Future Improvements

- More preset animations
- Timeline-based editing
- Export to multiple formats
- Save and reload animation configurations
- Better mobile responsiveness

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your work
5. Open a pull request

## License
MIT License

## Author

Created by [Marizza Ranasinghe](https://github.com/mariranasinghe)
