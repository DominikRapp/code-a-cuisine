# Code à Cuisine

Code à Cuisine is a responsive recipe discovery and AI-assisted recipe generation web app.

Users enter ingredients, choose cooking preferences and receive up to three suitable recipe suggestions. The app first searches the existing Firebase recipe library. When no suitable recipe is available, n8n can generate and store a new recipe through Google Gemini, subject to daily generation limits.

This project was created as a non-commercial student project for Developer Akademie GmbH.

## Features

* Ingredient input with autocomplete suggestions
* Recipe matching based on selected ingredients and preferences
* Up to three recipe results per request
* AI-assisted recipe generation when no suitable match is available
* Daily generation limits for individual users and the overall system
* Visible remaining daily recipe availability
* Generated recipe indicator on result cards
* Recipe detail pages with ingredients, nutrition values and cooking steps
* Local recipe likes
* Cookbook with cuisine categories, popular recipes and pagination
* Responsive desktop and mobile layouts
* Imprint and privacy pages

## Tech Stack

* Angular
* TypeScript
* SCSS
* Firebase Realtime Database
* Firebase Hosting
* n8n
* Google Gemini
* RxJS

## Application Flow

```text
Angular application
        |
        v
Firebase Realtime Database
        |
        v
n8n recipe workflow
        |
        +--> Match existing recipes
        |
        +--> Check daily generation quota
        |
        +--> Generate a new recipe with Google Gemini when needed
        |
        v
Firebase Realtime Database
        |
        v
Angular result page
```

The recipe generation workflow follows this process:

1. The Angular app stores a recipe request in Firebase.
2. Angular triggers the n8n recipe generation webhook.
3. n8n searches the existing recipe library for suitable matches.
4. When needed and quota is available, n8n requests a new recipe from Google Gemini.
5. New recipes, indexes and ingredient suggestions are stored in Firebase.
6. Angular reads the completed request and displays one to three recipes.

## Project Structure

```text
src/
  app/
    core/               Firebase configuration, services and application logic
    features/           Page-specific components and styles
    shared/             Shared models, helpers and reusable UI components
  environments/         Local environment configuration

firebase/
  seed/
    code-a-cuisine-seed.json

n8n/
  workflows/
    Code a Cuisine - Recipe Generation.json
    Code a Cuisine - Recipe Quota Status.json
    Code a Cuisine - Data Cleanup.json
    Code a Cuisine - Workflow Errors.json

database.rules.json
firebase.json
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the local environment file

Copy:

```text
src/environments/environment.example.ts
```

to:

```text
src/environments/environment.ts
```

Then add your Firebase configuration and n8n production webhook URLs.

```ts
export const environment = {
    production: false,
    firebase: {
        apiKey: 'YOUR_FIREBASE_API_KEY',
        authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
        databaseURL: 'YOUR_FIREBASE_DATABASE_URL',
        projectId: 'YOUR_FIREBASE_PROJECT_ID',
        storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
        messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
        appId: 'YOUR_FIREBASE_APP_ID',
    },
    n8n: {
        recipeGenerationWebhookUrl:
            'YOUR_N8N_RECIPE_GENERATION_WEBHOOK_URL',
        recipeQuotaStatusWebhookUrl:
            'YOUR_N8N_RECIPE_QUOTA_STATUS_WEBHOOK_URL',
    },
};
```

`environment.ts` is ignored by Git and must not be committed.

### 3. Start the development server

```bash
npm start
```

Open the local URL shown by Angular in the terminal.

## Available Scripts

```bash
npm start
```

Starts the Angular development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run watch
```

Builds the project continuously in development mode.

```bash
npm test
```

Runs the Angular test command.

## Firebase Setup

The project uses Firebase Realtime Database and Firebase Hosting.

### Firebase files

* [Firebase configuration](firebase.json)
* [Realtime Database rules](database.rules.json)
* [Clean Firebase seed data](firebase/seed/code-a-cuisine-seed.json)

The clean seed includes only:

```text
recipes
publicRecipes
recipeIndexes
ingredientSuggestions
```

It intentionally excludes live recipe requests, quota counters, workflow logs and IP-derived identifiers.

### Import the Firebase seed

Import the seed JSON at the root of your Firebase Realtime Database:

```text
firebase/seed/code-a-cuisine-seed.json
```

Use the Firebase Console import feature carefully, because importing data can overwrite existing data at the selected database path.

### Deploy Firebase Hosting and Rules

Install and authenticate the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

Then deploy:

```bash
npm run build
firebase deploy --only hosting,database
```

### Important security note

The included `database.rules.json` mirrors the current unauthenticated assessment setup:

```json
{
    "rules": {
        ".read": true,
        ".write": true
    }
}
```

These rules are suitable only for this temporary project setup. They must be replaced with restrictive, validated rules before using the project as a public production application.

## n8n Workflows

Import these workflows into n8n:

* [Recipe Generation](n8n/workflows/Code%20a%20Cuisine%20-%20Recipe%20Generation.json)
* [Recipe Quota Status](n8n/workflows/Code%20a%20Cuisine%20-%20Recipe%20Quota%20Status.json)
* [Data Cleanup](n8n/workflows/Code%20a%20Cuisine%20-%20Data%20Cleanup.json)
* [Workflow Errors](n8n/workflows/Code%20a%20Cuisine%20-%20Workflow%20Errors.json)

### Required workflow configuration

After importing the workflows:

1. Update all Firebase Realtime Database URLs for your Firebase project.
2. Connect a Google Gemini credential to the recipe generation workflow.
3. Connect a Microsoft Outlook credential to the workflow error notification node, or disable that email node.
4. Activate all workflows.
5. Copy the production webhook URLs into `environment.ts`.

### Webhook endpoints

| Workflow            | Method | Path                                      |
| ------------------- | ------ | ----------------------------------------- |
| Recipe Generation   | `POST` | `code-a-cuisine/recipe-generation`        |
| Recipe Quota Status | `GET`  | `code-a-cuisine/recipe-generation-status` |

The quota endpoint returns the currently available generation count without exposing Firebase quota records to the browser.

## Daily Generation Limits

The project uses two limits for newly generated recipes:

| Limit                     | Value |
| ------------------------- | ----: |
| Per user/IP per UTC day   |     3 |
| Entire system per UTC day |    12 |

The visible availability is always the lower remaining value of both limits.

Existing Firebase recipe matches do not consume generation quota.

## Data and Privacy

The project has no accounts, analytics tracking, advertising or newsletter system.

Recipe requests may process ingredients, quantities and cooking preferences. Firebase, n8n and Google Gemini are used only where needed to provide matching and recipe generation functionality.

See the in-app Imprint and Privacy pages for the project-specific legal information.

## Credits

Application code created by Dominik Rapp.

The visual design concept, Figma materials and graphic assets are based on project materials provided by Developer Akademie.

## Repository Notes

Do not commit:

* `src/environments/environment.ts`
* Firebase service account files
* n8n credentials
* raw Firebase database exports
* local `.n8n` data
* API keys or webhook secrets
