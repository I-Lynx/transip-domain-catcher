# TransIP Domain Catcher (Private Key Authentication)

Automatically monitor domains and register them as soon as they become available through the TransIP API.

This fork adds support for **TransIP Key Pair authentication**, removing the need for manually generated access tokens that expire after a limited period.

## Features

* ✅ Automatic domain availability checks
* ✅ Automatic domain registration when a domain becomes available
* ✅ Docker support
* ✅ TransIP API v6 support
* ✅ Secure Key Pair authentication
* ✅ Automatic generation of short-lived API access tokens
* ✅ Configurable check interval
* ✅ Multiple domain monitoring

## Why this fork?

The original project used a manually generated TransIP access token:

```
TRANSIP_ACCESS_TOKEN
```

These tokens have a limited lifetime and require manual renewal.

This fork adds support for the official TransIP authentication flow:

```
Private Key
    ↓
RSA-SHA512 signature
    ↓
TransIP Authentication API
    ↓
Temporary Access Token
    ↓
TransIP API
```

This allows the container to run continuously without manual token renewal.

## Requirements

* Docker
* A TransIP account
* A TransIP API Key Pair

## TransIP Key Pair Setup

1. Log in to the TransIP control panel.
2. Create an API Key Pair.
3. Download the private key.
4. Store the private key locally.

Example:

```
config/transip.key
```

⚠️ Never commit this file to Git.

The private key is ignored through `.gitignore`.

## Configuration

Create a `.env` file:

```env
TRANSIP_USERNAME=your_transip_username
```

Configure your domains in `docker-compose.yml`:

```yaml
environment:
  - TRANSIP_USERNAME=${TRANSIP_USERNAME}
  - TRANSIP_PRIVATE_KEY_FILE=/usr/src/app/config/transip.key
  - CHECK_INTERVAL_SECONDS=15
  - DOMAINS=example.com,example.org
```

## Running with Docker Compose

Build and start:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

## File Structure

```
.
├── config
│   ├── domains.json
│   └── transip.key        (not committed)
├── logs                   (not committed)
├── src
│   ├── auth
│   │   └── tokenManager.js
│   ├── domainCatcher.js
│   ├── index.js
│   └── transipClient.js
├── docker-compose.yml
└── Dockerfile
```

## Security Notes

The following files should never be committed:

```
.env
config/transip.key
logs/
```

The application runs inside Docker as a non-root user.

## Legacy Access Token Support

For backwards compatibility, an existing TransIP access token can still be used:

```env
TRANSIP_ACCESS_TOKEN=your_token_here
```

However, Key Pair authentication is recommended.

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Test authentication:

```bash
npm run test:credentials
```

## Credits

Original project:

Bjornftw/transip-domain-catcher

This fork continues development with additional TransIP Key Pair authentication support.

## License

MIT License
