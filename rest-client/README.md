# REST Client

This folder contains HTTP request files for testing the API endpoints using the VS Code REST Client extension.

## Prerequisites

Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for VS Code.

## Usage

1. Start the API server:

   ```bash
   pnpm api start:dev
   ```

2. Open the `.http` files in VS Code
3. Click "Send Request" above any HTTP request to execute it
4. View the response in the VS Code panel

## Files

- `api.http` - Basic API endpoint tests including the root endpoint

## Available Endpoints

- `GET /` - Returns "Hello World!" message from the API root endpoint

## Notes

- The API server runs on `http://localhost:8080` by default
- Make sure the API server is running before sending requests
- You can modify the requests or add new ones as needed
