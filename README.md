# Intelligence Hub

Intelligence Hub is an AI chat interface designed to allow users to engage in conversations with multiple chatbots simultaneously, providing more comprehensive responses and mitigating the risk of misleading information from hallucinations. The platform currently supports two chatbots: OpenAI's ChatGPT and Anthropic's Claude.

![Screenshot of Intelligence Hub](./screenshot.gif)

## Prerequisites

Before using Intelligence Hub, ensure that you have Node.js installed on your system. You can download and install Node.js and npm from the official Node.js website. The site provides pre-built installers for various platforms (Windows, macOS, Linux):

[Node.js Download Page](https://nodejs.org/en/download/)

## Installation

To install Intelligence Hub, follow these steps using npm:

```
npm install
npm run build
```

Note: The `npm install` command installs all the necessary dependencies, and `npm run build` compiles the application.

## Configuration

For configuring Intelligence Hub, start by duplicating the `.env.example` file and renaming it to `.env`. Then, fill in your API credentials and adjust other variables as needed.

```bash
cp .env.example .env
```

Access to both OpenAI's ChatGPT and Anthropic's Claude APIs is required to utilize Intelligence Hub fully. You can register for OpenAI's API at [https://platform.openai.com/signup](https://platform.openai.com/signup) and Anthropic's at [https://www.anthropic.com//](https://www.anthropic.com/). Once you have access, generate new API keys and configure the necessary credentials in the `.env` file.

## Modes

Intelligence Hub provides two operational modes:

1. **ECO Mode**: Engages with ChatGPT 3.5 and Claude 3 Sonnet for efficient and economical usage.
2. **PRO Mode**: Utilizes ChatGPT 4 and Claude 3 Opus for users seeking the most advanced conversational AI capabilities.

## Conversation History

To enhance user experience, the conversation history is stored locally in the browser, allowing for continuity across multiple sessions.

## Usage

To start Intelligence Hub, use the following command:

```
npm start
```
Afterwards, open your web browser and navigate to the provided local server address to start chatting with both ChatGPT and Claude simultaneously.

To clear the messages, simply type "clear" and press enter.

## Web App Support
Intelligence Hub is designed to be mobile-friendly and supports adding the app to the home screen on mobile devices. This feature allows users to access Intelligence Hub as a standalone app, providing a seamless experience similar to native mobile applications.

To add Intelligence Hub to your mobile device's home screen, follow these steps:

### iOS (Safari)
1. Open Intelligence Hub in Safari on your iOS device.
2. Tap the "Share" button (square with an up arrow) at the bottom of the screen.
3. Scroll down and tap "Add to Home Screen."
4. Customize the app name if desired, then tap "Add" in the top-right corner.
### Android (Chrome)
1. Open Intelligence Hub in Chrome on your Android device.
2. Tap the three-dot menu in the top-right corner.
3. Tap "Add to Home screen."
4. Customize the app name if desired, then tap "Add."

After adding Intelligence Hub to your home screen, you can launch it like any other app by tapping its icon.