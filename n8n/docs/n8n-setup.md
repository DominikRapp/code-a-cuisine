# n8n Setup

This folder contains the planned n8n automation setup for Code a Cuisine.

## Purpose

n8n will later handle backend automation tasks such as recipe generation workflows, quota checks, logging, error handling, and notification flows.

## Security Rules

- Do not commit real credentials.
- Do not commit production `.env` files.
- Do not commit exported workflows that contain credentials.
- Use `.env.example` only for placeholder variable names.

## Planned Workflow Requirements

- Validate incoming recipe generation requests.
- Check IP-based daily quota.
- Check system-wide daily quota.
- Generate exactly 3 recipe suggestions.
- Use at least 70% of provided ingredients.
- Add no more than 3 extra basic ingredients.
- Include nutrition values.
- Log successful and failed runs.
- Add error handling.
- Add an Error Trigger workflow.
- Send email notification on critical workflow errors.
- Respect quota and rate limits.