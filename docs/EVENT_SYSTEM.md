# CAFAIS Event Management System

## Overview

This document provides comprehensive documentation for the enhanced event management system implemented for the Cascadian Armed Forces (CASF) Discord bot.

## Features

### 🎯 Core Features
- **Role-based event permissions** - Different event types restricted by rank and department
- **Automated point calculation** - Configurable points per event type
- **Promotion automation** - Academy training automatically promotes eligible initiates
- **Rich Discord logging** - Container-based logging for events and promotions
- **Cooldown enforcement** - Time-in-rank requirements from cooldowns.ts
- **Extra participant management** - Toggle participants in/out of events

---

## Commands

### `/start-event`
**Permission:** NCO+ or Training Department  
**Description:** Initiates a new event

**Event Type Restrictions:**
- **Academy Training** → Training Department only
- **Lore** → Lore Department only
- **Combat Patrol, Money Grinding, Training, Other** → NCO+

**Options:**
- `name` (required) - Event name
- `eventtype` (required) - Type of event
- `notes` (optional) - Event notes
- `image` (optional) - Event image URL

**Example:**
```
/start-event name:"Patrol #42" eventtype:"Combat Patrol" notes:"Northern sector"
```

---

### `/academy-log`
**Permission:** Training Department only  
**Description:** Logs academy training and promotes eligible initiates to Private

**Behavior:**
- Collects all **Initiates** in the voice channel
- Promotes passing participants to **Private** (2 points each)
- Logs failed participants (0 points)
- Creates individual promotion logs for each successful promotion
- Logs complete academy event to events channel

**Options:**
- `eventname` (required) - Name of the academy event
- `extraparticipant1-5` (optional) - Toggle participants (adds if not present, removes if present)
- `failedparticipant1-5` (optional) - Mark participants as failed (will not be promoted)
- `notes` (optional) - Training observations
- `image` (optional) - Screenshot URL

**Example:**
```
/academy-log eventname:"Academy Session 5" extraparticipant1:@User1 failedparticipant1:@User2 notes:"User2 failed marksmanship"
```

**Promotion Logic:**
- Initiates are promoted to Private automatically
- Failed participants are logged with ❌ indicator
- Passing participants are logged with ✅ indicator
- Bypasses point and cooldown requirements
- Assigns Private rank role, removes Initiate role

---

### `/end-event`
**Permission:** Officer+  
**Description:** Ends a non-lore event and awards points

**Event Types:** Combat Patrol, Money Grinding, Training, Other

**Behavior:**
- Collects all members in the voice channel
- Calculates points based on duration and event type config
- Awards points to all participants
- Logs event to Discord events channel

**Options:**
- `name` (required) - Event name
- `eventtype` (required) - Type of event
- `extraparticipant1-5` (optional) - Toggle participants
- `notes` (optional) - Event observations
- `image` (optional) - Screenshot URL

**Example:**
```
/end-event name:"Patrol #42" eventtype:"Combat Patrol" extraparticipant1:@User1 notes:"Successful patrol"
```

---

### `/end-lore-event`
**Permission:** Lore Department only  
**Description:** Ends a lore event and awards points

**Behavior:**
- Same as `/end-event` but restricted to Lore Department
- Uses Lore event point configuration
- Logs to events channel

**Options:**
- `name` (required) - Lore event name
- `extraparticipant1-5` (optional) - Toggle participants
- `notes` (optional) - Event observations
- `image` (optional) - Screenshot URL

**Example:**
```
/end-lore-event name:"Operation Shadowfall" extraparticipant1:@User1 notes:"Excellent roleplay"
```

---

## Configuration

### Event Points Configuration
**File:** `src/config/eventPoints.json`

Defines point calculation per event type:

```json
{
  "eventTypes": {
    "Combat Patrol": {
      "basePerHour": 2,
      "bonusPer30Min": 1,
      "description": "Combat-focused patrol missions"
    },
    "Training": {
      "basePerHour": 2,
      "bonusPer30Min": 1,
      "description": "Standard training sessions"
    }
  }
}
```

**Point Calculation Formula:**
```
points = (hours × basePerHour) + (floor(minutes / 30) × bonusPer30Min)
```

**Example:** 2h 45m event with Combat Patrol config (2/1):
- Hours: 2 × 2 = 4 points
- 30-min intervals: floor(45/30) × 1 = 1 point
- **Total:** 5 points

---

### Rank Cooldowns
**File:** `src/ranks/cooldowns.ts`

Defines promotion requirements:

```typescript
export const rankRequirements: Record<string, RankRequirement> = {
    PVT: { cooldownDays: 0, minPoints: 0 },
    SPV: { cooldownDays: 1, minPoints: 2 },
    SSP: { cooldownDays: 1, minPoints: 4 },
    // ... more ranks
};
```

**Used by:** Promotion system to enforce time-in-rank and point requirements

---

## Discord Logging

### Promotion Logs
**Channel ID:** `1454639433566519306`

**Format:**
```
# 📈 Promotion Logged

User: @Username (User#1234)
Promotion: INT → PVT
Promoted By: @Trainer (Trainer#5678)
Reason: Completed academy training: Academy Session 5
Timestamp: January 5, 2026 10:30 AM
```

---

### Event Logs
**Channel ID:** `1454639394605498449`

**Format:**
```
# 🎯 Event: Patrol #42

Event Type: Combat Patrol
Host: @Commander (Commander#1234)
Started: January 5, 2026 9:00 AM
Ended: January 5, 2026 11:30 AM
Duration: 2 hours 30 minutes
Participants: 5
Points Awarded: 5 per participant

Participant List:
• @User1 - 5 points
• @User2 - 5 points
• @User3 - 5 points
• @User4 - 5 points
• @User5 - 5 points
```

---

### Academy Training Logs
**Channel ID:** `1454639394605498449`

**Format:**
```
# 🎓 Academy Training: Academy Session 5

Host: @Trainer (Trainer#5678)
Started: January 5, 2026 8:00 AM
Ended: January 5, 2026 9:00 AM
Duration: 1 hour
Total Participants: 3
Promoted to Private: 2
Failed: 1

Participants:
✅ @Initiate1 - Promoted to Private (2 points)
✅ @Initiate2 - Promoted to Private (2 points)
❌ @Initiate3 - Not Promoted (0 points)
```

---

## Architecture

### File Structure

```
src/
├── config/
│   └── eventPoints.json          # Event point configuration
├── types/
│   ├── events.ts                 # Event type definitions
│   └── ranking.ts                # Ranking type definitions
├── features/
│   ├── discordLogger.ts          # Container-based Discord logging
│   └── rankingManager.ts         # Centralized promotion system
├── commands/events/
│   ├── start-event.ts            # Start events
│   ├── academy-log.ts            # Academy training logging
│   ├── end-event.ts              # End regular events
│   └── end-lore-event.ts         # End lore events
└── ranks/
    └── cooldowns.ts              # Rank requirements (existing)
```

---

### Key Systems

#### 1. **Ranking Manager** (`src/features/rankingManager.ts`)
Centralized promotion system with:
- Cooldown enforcement
- Point requirement validation
- Rank lock checking
- Role management (remove old, assign new)
- Batch promotion support

**Functions:**
- `promoteUser()` - Promotes single user with full validation
- `batchPromoteUsers()` - Promotes multiple users (used by academy-log)
- `checkCooldown()` - Validates time-in-rank requirements
- `getUserPoints()` - Fetches user's current points
- `isRankLocked()` - Checks if user is rank-locked

---

#### 2. **Discord Logger** (`src/features/discordLogger.ts`)
Container-based logging system using Discord.js ContainerBuilder:
- `logPromotion()` - Logs promotions to audit channel
- `logEvent()` - Logs regular events to events channel
- `logAcademyTraining()` - Logs academy sessions with pass/fail indicators
- `logDemotion()` - Logs demotions (future use)

**Benefits:**
- Rich formatting with containers
- Consistent visual style
- Easy to extend

---

#### 3. **Extra Participant Toggle**
All event ending commands support extra participant fields:

**Logic:**
```typescript
Initial VC members: [User1, User2, User3]
extraparticipant1: User4  → Add User4 (not in VC)
extraparticipant2: User2  → Remove User2 (already in VC)
extraparticipant3: User5  → Add User5 (not in VC)

Final participants: [User1, User3, User4, User5]
```

**Use Cases:**
- Adding users who left early
- Removing users who joined late
- Correcting participant lists

---

## Database Schema

### EventParticipant
```prisma
model EventParticipant {
  id            Int      @id @default(autoincrement())
  eventId       Int
  userDiscordId String
  points        Int
  event         Event    @relation(fields: [eventId], references: [id])
  user          UserProfile @relation(fields: [userDiscordId], references: [discordId])

  @@unique([eventId, userDiscordId])
}
```

### RankCooldown
```prisma
model RankCooldown {
  id            Int      @id @default(autoincrement())
  userDiscordId String
  rank          String
  cooldownUntil DateTime
  createdAt     DateTime @default(now())
  user          UserProfile @relation(fields: [userDiscordId], references: [discordId])
}
```

---

## Error Handling

All commands include comprehensive error handling:

### Common Error Responses

**Permission Denied:**
```
❌ This command can only be used by Training Department members.
```

**Event Not Found:**
```
❌ No active event found with name "Patrol #42" and type "Combat Patrol".
```

**No Voice Channel:**
```
❌ You must be in a voice channel to end the event and collect participants.
```

**Database Error:**
```
❌ Failed to log academy training. Please try again or contact an administrator.
```

---

## Best Practices

### For Training Department
1. Start academy event with `/start-event eventtype:"Academy Training"`
2. Conduct training session
3. Use `/academy-log` to promote passers
4. Mark failed participants explicitly
5. Add notes for record-keeping

### For Event Hosts
1. Start event with `/start-event`
2. Conduct event
3. Use `/end-event` to award points
4. Use extra participants to adjust lists
5. Add screenshots via image option

### For Administrators
1. Review promotion logs regularly
2. Monitor point accumulation
3. Update event points config as needed
4. Check for cooldown violations
5. Verify role assignments

---

## Role IDs Reference

| Role | ID |
|------|-----|
| Training Department | 1454232274273959957 |
| Lore Department | 1454232358814003341 |
| Initiate (INT) | 1454248763915898971 |
| Private (PVT) | 1454248722891407472 |

---

## Troubleshooting

### Promotion Not Working
**Check:**
1. User has Initiate role
2. User is not in failed participants list
3. User is not rank-locked
4. Rank roles exist in Discord server

### Points Not Calculating
**Check:**
1. Event type exists in eventPoints.json
2. Event has valid start time
3. Duration is positive

### Logging Not Working
**Check:**
1. Bot has permissions in log channels
2. Channel IDs are correct
3. Discord API is responsive

---

## Future Enhancements

**Potential improvements:**
- Web dashboard for event history
- Automated rank progression notifications
- Point leaderboards
- Event templates
- Multi-event participation tracking
- Promotion approval workflows
- Demotion command implementation

---

## Support

For technical support or bug reports:
1. Check error logs in console
2. Verify configuration files
3. Review Discord bot permissions
4. Contact bot developers

**Version:** 1.0.0  
**Last Updated:** January 5, 2026
