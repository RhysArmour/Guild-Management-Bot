import dotenv from 'dotenv';
dotenv.config();
const { token, clientId } = process.env;

if (!clientId || !token) {
  throw new Error('Missing environment variable');
}

const config: Record<string, string> = {
  clientId,
  token,
};

export default config;
