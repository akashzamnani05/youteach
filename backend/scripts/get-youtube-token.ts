// scripts/get-youtube-token.ts

/**
 * One-time script to get YouTube OAuth refresh token
 * 
 * Usage:
 * 1. Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env
 * 2. Run: npx ts-node scripts/get-youtube-token.ts
 * 3. Follow the authorization URL in browser
 * 4. Copy the code from the redirect URL
 * 5. Paste it when prompted
 * 6. Save the refresh token to .env as YOUTUBE_REFRESH_TOKEN
 */

import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

async function getRefreshToken() {
  // Generate the authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force to get refresh token
  });

  console.log('\n==========================================');
  console.log('YouTube OAuth Setup - Get Refresh Token');
  console.log('==========================================\n');
  console.log('1. Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n2. Authorize the application');
  console.log('3. You will be redirected to a URL like:');
  console.log('   http://localhost:5000/auth/google/callback?code=XXXXXXXX\n');
  console.log('4. Copy the CODE from the URL and paste it below\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code: ', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\n✅ Success! Here are your tokens:\n');
      console.log('==========================================');
      console.log('Add these to your .env file:');
      console.log('==========================================\n');
      console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('\n==========================================');
      console.log('\nYou can also store these for reference:');
      console.log('Access Token (expires in 1 hour):', tokens.access_token);
      console.log('Token Type:', tokens.token_type);
      console.log('Expiry Date:', new Date(tokens.expiry_date || 0).toISOString());
      console.log('==========================================\n');
    } catch (error: any) {
      console.error('\n❌ Error getting tokens:', error.message);
      console.error('\nMake sure:');
      console.error('1. The authorization code is correct');
      console.error('2. You copied the ENTIRE code from the URL');
      console.error('3. The code has not expired (try again if it has)');
    }

    rl.close();
  });
}

// Validate environment variables
if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
  console.error('❌ Error: Missing required environment variables');
  console.error('\nPlease set the following in your .env file:');
  console.error('- YOUTUBE_CLIENT_ID');
  console.error('- YOUTUBE_CLIENT_SECRET');
  console.error('- YOUTUBE_REDIRECT_URI (optional, defaults to http://localhost:5000/auth/google/callback)');
  process.exit(1);
}

getRefreshToken();