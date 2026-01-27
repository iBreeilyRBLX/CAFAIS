<div align="center">
  <br />
  <p>
    <img src="https://i.imgur.com/LAV5caA.png" width="546" alt="CAFAIS Discord Bot" />
  </p>

![Discord.js](https://img.shields.io/badge/discord.js-v14-blue?logo=discord&logoColor=ffffff)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
[![wakatime](https://wakatime.com/badge/user/253ccef5-d3ad-4ddc-ae2d-16cd37ea3df9/project/d09e1316-3c85-40a6-b4ea-f27de31754d2.svg)](https://wakatime.com/badge/user/253ccef5-d3ad-4ddc-ae2d-16cd37ea3df9/project/d09e1316-3c85-40a6-b4ea-f27de31754d2)
  
</div>

# CAFAIS - Cascadian Armed Forces Bot

Personal Discord bot project for managing the Cascadian Armed Forces community with member applications, ranking systems, academy training, and event management.

---

## Features

- **Member Application System** - Application processing with approval/denial/ban workflows
- **Ranking System** - Hierarchical rank structure with promotions, demotions, and point tracking
- **Academy Training** - Training event logging with automatic promotion of completing initiates
- **Event Management** - Create, log, and track training events with participant tracking
- **OAuth Integration** - Roblox account linking and verification
- **Point System** - Award points for event completion and participation
- **Logging System** - Comprehensive logging of promotions, demotions, applications, and events
- **Sharding Support** - Ready for scaling with Discord's sharding system
- **Slash Commands** - Modern Discord slash commands with guild and global deployment
- **Interaction Handling** - Buttons, modals, and select menus for user interactions
- **PM2 Process Management** - Production-ready with automatic restarts and logging

---

## Installation

Install required dependencies:

```bash
npm install
```

Create a `.env` file in the root directory with your bot token:

```env
TOKEN=your_discord_bot_token_here
```

### Configuration

Configuration is located in `src/config.json`:

- **guild** - Server ID where guild commands deploy
- **receiveMessageComponents** - Enable button/select menu interactions
- **receiveModals** - Enable modal form interactions
- **splitCustomId** - Parse custom IDs by underscores for metadata
- **channels** - Discord channel IDs for logging and operations
- **roles** - Role IDs for ranks and member states

---

## Scripts

### Development

Start bot without sharding:
```bash
npm run start:bot
npm run start
```

Start with sharding manager:
```bash
npm run start:manager
```

Run uncompiled bot (faster iteration):
```bash
npm run dev:bot
npm run dev:manager
```

### Production

Build TypeScript to JavaScript:
```bash
npm run build
```

Start with PM2 process manager:
```bash
pm2 start ecosystem.config.js
```

---

## Core Features

### Member Applications
- Applicants submit applications via modal form
- Staff can approve, deny, or ban applicants
- Automatic role assignment and DM notifications
- Application history tracking with Roblox integration

### Ranking System
- Promote/demote members between 24 ranks
- Point-based progression requirements
- Cooldown system to prevent rank spam
- Comprehensive promotion/demotion logs

### Academy Training
- Training Department logs academy sessions
- Automatic promotion of passing Initiates to Private
- Failed participant marking for remedial training
- Event participation tracking with point awards
- Voice channel participant detection with manual adjustments

### Event Management
- Create and log training events
- Track participants and outcomes
- Award points for event completion
- Support for extra participants and failed marks

---

## Project Structure

```
src/
├── commands/              # Slash commands organized by category
│   ├── events/           # Event management commands
│   ├── ranking/          # Ranking system commands
│   └── application/      # Application processing commands
├── interactions/         # Buttons, modals, select menus
├── features/            # Core bot features
├── utilities/           # Helper functions and validators
├── database/            # Prisma ORM schema and migrations
├── types/               # TypeScript type definitions
├── ranks/               # Rank definitions and permissions
├── messages/            # Discord message templates
└── config.json          # Bot configuration
```

---

## Key Technologies

- **Discord.js v14** - Discord API interactions
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database management
- **Express.js** - OAuth server
- **PM2** - Process management

---

## Development Notes

**Started:** 2024 | **Status:** Active Development | **Built with:** Discord.js v14 & TypeScript