# [Cardify](https://cardify-two.vercel.app/): Virtual Visiting Card Generator

Cardify is a modern, web-based application that allows users to effortlessly create, customize, and download professional virtual visiting cards. With a live preview and a wide range of customization options, creating your perfect digital card has never been easier.

## ✨ Key Features

- **📝 Dynamic Input Form**: Easily input your business and contact details, including company logo, slogan, social media links, and more.
- **👁️ Live Preview**: See your virtual card update in real-time as you type, ensuring you get the perfect design.
- **🎨 Rich Customization**: Choose from multiple professional templates, pick your own brand colors, and select from a wide range of Google Fonts.
- **📱 QR Code Generation**: Automatically generate a QR code that can link to your vCard (contact details), website, or any custom URL.
- **📤 Export & Share**: Download your final card as a high-quality PNG image or as an interactive PDF with clickable links.
- **🔒 User Authentication**: Securely save your card designs to your personal account.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication & Database**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18.x or later) and npm installed on your machine.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your_username/cardify.git
   ```
2. Navigate to the project directory:
   ```sh
   cd cardify
   ```
3. Install NPM packages:
   ```sh
   npm install
   ```
4. Set up your environment variables by creating a `.env.local` file in the root and adding your Firebase and other necessary API keys.

### Running the Application

To run the app in development mode, execute the following command:

```sh
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
