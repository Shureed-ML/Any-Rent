const { driver } = require('@rocket.chat/sdk');

// Rocket.Chat server configuration
const HOST = process.env.ROCKET_CHAT_URL || 'http://localhost:3000';
const USER = process.env.ROCKET_CHAT_USER || 'bot';
const PASS = process.env.ROCKET_CHAT_PASSWORD || 'bot-password';
const SSL = process.env.ROCKET_CHAT_SSL === 'true';
const TIMEOUT = parseInt(process.env.ROCKET_CHAT_TIMEOUT) || 20000;

let isConnected = false;

async function connectToRocketChat() {
    if (isConnected) return true;
    
    try {
        // Connect to Rocket.Chat server
        await driver.connect({ host: HOST, useSsl: SSL, timeout: TIMEOUT });
        console.log('Successfully connected to Rocket.Chat server');

        // Login with bot user
        await driver.login({ username: USER, password: PASS });
        console.log('Successfully logged in to Rocket.Chat');

        // Subscribe to messages
        await driver.subscribeToMessages();

        return true;
    } catch (error) {
        console.error('Failed to connect to Rocket.Chat:', error);
        return false;
    }
}

module.exports = {
    connectToRocketChat,
    driver
};
