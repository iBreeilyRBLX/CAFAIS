# Discord Bot Design Style Guide
> **CASF Bot Visual Design Standards**  
> Last Updated: January 24, 2026

This guide ensures consistent, professional, and visually appealing messages across all bot interactions.

---

## 🎨 Color Palette & Accent Colors

All containers should use accent colors to convey meaning at a glance:

| Color | Hex Code | RGB | Emoji | Usage | Examples |
|-------|----------|-----|-------|-------|----------|
| 🟢 **Success Green** | `#2ECC71` | `0x2ECC71` | ✅ 🎉 | Promotions, approvals, successful operations | Promotion logs, application approvals, successful verifications |
| 🔴 **Error Red** | `#E74C3C` | `0xE74C3C` | ❌ 🚫 | Errors, critical issues, failed operations | Permission errors, failed verifications, invalid data |
| 🟡 **Info Yellow** | `#F39C12` | `0xF39C12` | ⚠️ 🎯 | General events, informational messages | Event completions, general announcements |
| 🔵 **Primary Blue** | `#3498DB` | `0x3498DB` | 📊 💎 | Academy training, participants, data displays | Training logs, participant lists, statistics |
| 🟣 **Purple** | `#9B59B6` | `0x9B59B6` | 📋 🎖️ | Breakdown sections, detailed lists | Participant breakdowns, categorized lists |
| 🟠 **Warning Orange** | `#E67E22` | `0xE67E22` | ⚠️ 📉 | Warnings, demotions, cautions, additional info | Demotions, blocking messages, notes sections |
| 🟦 **Discord Blurple** | `#5865F2` | `0x5865F2` | 🔐 ✨ | Verification, Discord-specific features | Onboarding, verification prompts |

### Usage Guidelines:
- **Always** use accent colors on containers via `.setAccentColor(0xHEXCODE)`
- **Never** mix multiple accent colors in a single container
- Use **green** for positive outcomes, **red** for errors, **orange** for warnings
- When in doubt, use **blue** for neutral information

---

## 📝 Typography & Formatting

### Header Hierarchy

```typescript
// Page/Message Title - Use sparingly, only for main message title
'# 🎯 Main Title'

// Section Headers - Primary use case for most containers
'## 📊 Section Title'

// Subsections - For nested information
'### 📋 Subsection Title'
```

**Rules:**
- ✅ Use `##` (H2) for container section headers
- ✅ Use `#` (H1) only for standalone title displays
- ✅ Always include a relevant emoji before titles
- ❌ Don't use H1 inside containers (looks too large)

### Text Formatting Patterns

```typescript
// Labels with bold
'**👤 Label:** Value'

// Italic for emphasis or notes
'**Reason:** *User completed training*'

// Code blocks for multi-line text
'**Application Response:**\n```\nLong text here\n```'

// Lists with bullets
'• Item one\n• Item two\n• Item three'

// Structured data with box-drawing characters
'**User Information:**\n├ 👤 Name: John Doe\n├ 📧 Email: john@example.com\n└ ⭐ Points: 50'
```

**Rules:**
- ✅ Always bold labels, keep values regular weight
- ✅ Use italic for reasons, notes, and emphasis
- ✅ Use `\n` for line breaks, `\n\n` for paragraph breaks
- ✅ Box-drawing chars (├ └ │) for structured lists
- ❌ Don't use excessive formatting (keep it clean)

---

## 🎭 Emoji Guidelines

### Standard Emoji Library

Better emoji alternatives for cleaner appearance:

| Category | Emojis | Usage |
|----------|--------|-------|
| **Users** | 👤 👥 🧑 🆔 | User mentions, member counts, profiles, IDs |
| **Actions** | ✅ ❌ ⚠️ 🔄 ✏️ 📝 | Success, failure, warning, processing, editing, writing |
| **Military/Ranks** | 🎖️ 🪖 ⚔️ 🛡️ 🎗️ | Promotions, demotions, ranks, achievements |
| **Data** | 📊 📈 📉 💎 🏅 📌 | Statistics, promotions, demotions, points, badges, pins |
| **Time** | ⏰ 🕐 ⏱️ 📅 🗓️ | Timestamps, duration, scheduling, calendar |
| **Content** | 📝 📋 📄 🎓 🎯 📢 | Notes, lists, documents, training, events, announcements |
| **Communication** | 💬 📬 📨 🔔 📣 | Messages, mail, notifications, alerts |
| **Status** | 🟢 🔴 🟡 🔵 ⚪ 🟣 | Online, offline, busy, active, inactive, special |
| **Gaming** | 🎮 🕹️ 🏆 🎲 🎪 | Gaming, controllers, achievements, random, events |
| **Celebration** | 🎉 🎊 ✨ 🌟 💫 🎆 | Approvals, milestones, achievements, special events |
| **Navigation** | ▶️ ⏸️ ⏹️ 🔼 🔽 ➡️ | Play, pause, stop, up, down, forward |
| **Identity** | 🆔 🔖 🏷️ 📛 👁️ | IDs, tags, labels, badges, viewing |

### Custom Emoji Support

Discord allows custom emojis from your server! These look much better for specific branding.

#### How to Use Custom Emojis

1. **Upload to your Discord server** (Server Settings → Emoji)
2. **Get the emoji syntax:**
   - Right-click emoji in Discord → Copy Link
   - Format: `<:emoji_name:emoji_id>` (static) or `<a:emoji_name:emoji_id>` (animated)
   - Example: `<:roblox:1234567890>` or `<:casf:9876543210>`

3. **Use in code:**
```typescript
container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        '<:roblox:1234567890> **Roblox Profile:** Username'
    )
);

// For button emojis
.setEmoji({ name: 'emoji_name', id: 'emoji_id' })
// or
.setEmoji('<:emoji_name:emoji_id>')
```

#### Recommended Custom Emojis to Add

For a military/faction bot like CASF, consider adding:

| Emoji Name | Purpose | Alternative Standard |
|------------|---------|---------------------|
| `:roblox:` | Roblox profile links | 🎮 |
| `:casf:` | Your faction logo/badge | 🎖️ |
| `:rank_up:` | Promotions | 📈 |
| `:rank_down:` | Demotions | 📉 |
| `:training:` | Academy/training | 🎓 |
| `:verified:` | Verified users | ✅ |
| `:points:` | Point system | ⭐ or 💎 |
| `:medal:` | Achievements | 🏅 |
| `:event:` | Events | 🎯 |
| `:application:` | Applications | 📝 |

**Where to find good custom emojis:**
- [emoji.gg](https://emoji.gg) - Free Discord emojis
- [discordemoji.com](https://discordemoji.com) - Curated collections
- Custom design on Fiverr/Upwork
- Create your own (512x512 PNG, transparent background)

### Emoji Usage Rules

- ✅ **Prefer custom emojis** for brand identity (Roblox, CASF logo)
- ✅ **Use standard emojis** for universal actions (✅ ❌ ⚠️)
- ✅ Use one emoji per label/section (consistency)
- ✅ Match emoji to context (🎖️ for ranks, 💎 for points)
- ✅ Use emojis in headers for visual scanning
- ✅ Test emoji appearance on mobile devices
- ❌ Don't overuse emojis (max 1-2 per line)
- ❌ Don't use animated emojis excessively (distracting)
- ❌ Don't mix custom and standard for same purpose

---

## 🏗️ Container Structure Patterns

### Single Container Pattern
*Use for: Simple messages, errors, confirmations*

```typescript
const container = new ContainerBuilder()
    .setAccentColor(0x2ECC71);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## ✅ Success Title')
);

container.addSeparatorComponents(
    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true })
);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        '**👤 User:** Username\n' +
        '**📊 Action:** Description'
    )
);
```

### Multi-Container Pattern
*Use for: Complex data, categorized information, logs*

```typescript
// Title (standalone)
const titleDisplay = new TextDisplayBuilder()
    .setContent('# 🎯 Main Title');

// Header Container (with accent)
const headerContainer = new ContainerBuilder()
    .setAccentColor(0x3498DB);
// ... add header content ...

// Data Container (different accent)
const dataContainer = new ContainerBuilder()
    .setAccentColor(0x9B59B6);
// ... add data content ...

// Send all components
await channel.send({ 
    components: [titleDisplay, headerContainer, dataContainer],
    flags: MessageFlags.IsComponentsV2 
});
```

**Rules:**
- ✅ Group related information in the same container
- ✅ Use separate containers for different categories
- ✅ Always use separators between sections within a container
- ✅ Include title display when using multiple containers

---

## ✅ Success Messages

### Standard Success Pattern

```typescript
const container = new ContainerBuilder()
    .setAccentColor(0x2ECC71); // Green for success

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## ✅ [Action] Successful')
);

container.addSeparatorComponents(
    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true })
);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        '**👤 Target:** [username]\n' +
        '**🔄 Action:** [what happened]\n' +
        '**📊 Result:** [outcome]\n\n' +
        '**✍️ By:** [executor]'
    )
);
```

**Key Elements:**
- Green accent color (`0x2ECC71`)
- Clear action in title (Promotion Successful, Verified, etc.)
- Who, what, result format
- Executor/timestamp at bottom

---

## ❌ Error Messages

### Standard Error Pattern

```typescript
const container = new ContainerBuilder()
    .setAccentColor(0xE74C3C); // Red for errors

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## ❌ Error Title')
);

container.addSeparatorComponents(
    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true })
);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        '**Issue:** [What went wrong]\n' +
        '**Action:** [What user should do]'
    )
);
```

**Key Elements:**
- Red accent color (`0xE74C3C`)
- Clear error type in title
- **Issue:** explains what's wrong
- **Action:** tells user how to fix it
- Avoid technical jargon (user-friendly language)

### Error Message Templates

```typescript
// Permission Error
'**Issue:** You lack the required permissions.\n' +
'**Action:** Contact an administrator for assistance.'

// Data Not Found
'**Issue:** [Item] not found in database.\n' +
'**Action:** Please verify the information and try again.'

// Validation Error
'**Issue:** [Field] does not meet requirements.\n' +
'**Action:** Ensure [specific requirement].'

// System Error
'**Issue:** An unexpected error occurred.\n' +
'**Action:** Please try again or contact support.'
```

---

## ⚠️ Warning Messages

### Standard Warning Pattern

```typescript
const container = new ContainerBuilder()
    .setAccentColor(0xE67E22); // Orange for warnings

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## ⚠️ Warning Title')
);

container.addSeparatorComponents(
    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true })
);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        '**⚠️ Notice:** [Important information]\n\n' +
        '[Additional context or instructions]'
    )
);
```

**Use For:**
- Blocking actions (missing verification)
- Demotions
- Important notices
- Rate limits or cooldowns

---

## 📊 Data Display Patterns

### List Display

```typescript
// Simple bullet list
'• Item 1\n' +
'• Item 2\n' +
'• Item 3'

// Categorized list with box-drawing
'**Promoted (3):**\n' +
'├ User1 (+2 pts)\n' +
'├ User2 (+2 pts)\n' +
'└ User3 (+2 pts)\n\n' +
'**Failed (1):**\n' +
'└ User4'

// Mention list with status
'✅ <@123456> - Completed\n' +
'❌ <@789012> - Failed\n' +
'⏳ <@345678> - Pending'
```

### Statistics Display

```typescript
'**📊 Statistics:**\n' +
'**👥 Total Participants:** 25\n' +
'**✅ Passed:** 20 (80%)\n' +
'**❌ Failed:** 5 (20%)\n' +
'**⭐ Points Awarded:** 40'
```

### Timeline/History

```typescript
'**📅 Timeline:**\n' +
'├ 🕐 **Started:** <t:1234567890:f>\n' +
'├ ⏱️ **Duration:** 45 minutes\n' +
'└ ✅ **Ended:** <t:1234570000:f>'
```

---

## 🔗 Buttons & Action Rows

### Button Patterns

```typescript
// Primary action button
const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('actionId')
            .setLabel('Primary Action')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅')
    );

container.addActionRowComponents(buttonRow);
```

**Button Style Guide:**
| Style | Use Case | Example |
|-------|----------|---------|
| `Primary` (Blue) | Main actions | Start Application, Verify Now |
| `Secondary` (Gray) | Alternative actions | Cancel, Skip |
| `Success` (Green) | Confirmations | Approve, Accept |
| `Danger` (Red) | Destructive actions | Deny, Delete |
| `Link` | External links | View Profile, Open Page |

---

## 📏 Best Practices

### DO ✅

1. **Always use accent colors** on containers
2. **Include emojis** in section headers for visual scanning
3. **Use separators** between distinct sections
4. **Format labels consistently** (bold labels, regular values)
5. **Provide actionable error messages** (Issue + Action)
6. **Use Discord timestamps** (`<t:timestamp:f>`) for dates
7. **Keep messages concise** (under 2000 characters)
8. **Test on mobile** (emojis render differently)
9. **Use mentions** for users (`<@userId>`)
10. **Group related data** in the same container

### DON'T ❌

1. **Don't use H1 headers** inside containers (too large)
2. **Don't mix accent colors** in one container
3. **Don't overuse emojis** (max 1-2 per line)
4. **Don't use technical jargon** in user-facing messages
5. **Don't skip separators** between sections
6. **Don't use plain text** when containers are available
7. **Don't forget the IsComponentsV2 flag**
8. **Don't exceed Discord's limits** (2000 chars, 25 components)
9. **Don't use deprecated fields** (content/embeds with v2)
10. **Don't hardcode channel IDs** in messages (use config)

---

## 📐 Component Limits

### Discord Limits (Components V2)

- **Max components per message:** 40
- **Max text length:** 2000 characters per TextDisplay
- **Max containers:** No hard limit (but keep under 10 for readability)
- **Max buttons per ActionRow:** 5
- **Max ActionRows:** Multiple allowed in containers

### Recommended Limits

- **Containers per message:** 3-5 (optimal readability)
- **Sections per container:** 3-4 (with separators)
- **List items:** 15-20 max (paginate if more)
- **Buttons per message:** 2-3 (don't overwhelm users)

---

## 🎯 Quick Reference Templates

### Custom Emoji Setup Example

```typescript
// Your custom emojis are configured in src/config/emojis.ts
import { CUSTOM_EMOJIS, getRobloxEmoji, getDiscordEmoji } from '../config/emojis';

// Available custom emojis:
// Discord variants (white, lightBlurple, blurple, black)
CUSTOM_EMOJIS.discord.white           // <:DiscordSymbolWhite:1464691985481728285>
CUSTOM_EMOJIS.discord.lightBlurple    // <:DiscordSymbolLightBlurple:1464691971053453558>
CUSTOM_EMOJIS.discord.blurple         // <:DiscordSymbolBlurple:1464691955165298769>
CUSTOM_EMOJIS.discord.black           // <:DiscordSymbolBlack:1464691939000582431>
CUSTOM_EMOJIS.discord.default         // Uses blurple by default

// Roblox variants (black, white)
CUSTOM_EMOJIS.roblox.black            // <:RobloxBlack:1464691000516804819>
CUSTOM_EMOJIS.roblox.white            // <:RobloxWhite:1464690940521484513>
CUSTOM_EMOJIS.roblox.default          // Uses white by default

// Usage in messages
import { CUSTOM_EMOJIS } from '../config/emojis';

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        `${CUSTOM_EMOJIS.roblox.default} **Roblox:** ${username}\n` +
        `${CUSTOM_EMOJIS.discord.default} **Discord:** ${discordTag}\n` +
        `⭐ **Points:** ${points}\n` +
        `✅ **Status:** Verified`
    )
);

// Or use helper functions for theme selection
container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        `${getRobloxEmoji('white')} **Roblox Profile**\n` +
        `${getDiscordEmoji('blurple')} **Discord Verification**`
    )
);
```

### Promotion Log
```typescript
const container = new ContainerBuilder().setAccentColor(0x2ECC71);
container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📈 Promotion'));
// Or with custom emoji: `## ${CUSTOM_EMOJIS.rankUp} Promotion`
// Add separator + details
```

### Event Log
```typescript
const container = new ContainerBuilder().setAccentColor(0xF39C12);
container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🎯 Event Complete'));
// Add separator + details
```

### Error Message
```typescript
const container = new ContainerBuilder().setAccentColor(0xE74C3C);
container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ Error'));
container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
container.addTextDisplayComponents(new TextDisplayBuilder().setContent('**Issue:** X\n**Action:** Y'));
```

### Application with Custom Branding
```typescript
// Using custom emojis for branding
import { CUSTOM_EMOJIS } from '../config/emojis';

const container = new ContainerBuilder().setAccentColor(0x57F287);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        `## ✅ Application Approved`
    )
);

container.addSeparatorComponents(
    new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true })
);

container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        `👤 **Applicant:** ${username}\n` +
        `${CUSTOM_EMOJIS.roblox.default} **Roblox:** ${robloxName}\n` +
        `${CUSTOM_EMOJIS.discord.default} **Discord:** ${discordTag}\n` +
        `✅ **Status:** Verified\n` +
        `⭐ **Starting Points:** 0`
    )
);
```

---

## 💡 Pro Tips for Custom Emojis

### Getting Emoji IDs

**Method 1: Developer Mode**
1. Enable Developer Mode (User Settings → Advanced → Developer Mode)
2. Right-click emoji → Copy ID
3. Format: `<:name:ID>` or `<a:name:ID>` (animated)

**Method 2: Backslash Trick**
1. Type `\:emoji_name:` in Discord
2. Discord will show you the full format
3. Copy and use in your code

### Emoji Best Practices

✅ **DO:**
- Upload 512x512 PNG images for best quality
- Use transparent backgrounds
- Name emojis clearly (`:casf_logo:` not `:logo1:`)
- Keep animated emojis under 256KB
- Test on both light and dark Discord themes
- Create matching sets (e.g., `:rank_1:` through `:rank_10:`)
- Use SVG → PNG converters for crisp icons

❌ **DON'T:**
- Don't upload copyrighted images without permission
- Don't use emoji names with special characters
- Don't make emojis too detailed (won't be visible when small)
- Don't exceed server emoji limits (50 static + 50 animated for non-boosted)
- Don't use similar names (`:roblox:` and `:roblox_icon:` is confusing)

### Fallback Strategy

Always have fallback for servers without your custom emojis:

```typescript
// Utility function for emoji fallback
export function getEmoji(customEmoji: string, fallback: string): string {
    // In production, you might check if emoji exists
    // For now, always return custom if available
    return customEmoji || fallback;
}

// Usage
const rankEmoji = getEmoji(CUSTOM_EMOJIS.rankUp, '📈');
container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${rankEmoji} Promotion Successful`)
);
```

---

## 🚀 Migration Checklist

When updating old containers:

- [ ] Add accent color to container
- [ ] Change H1 (`#`) to H2 (`##`) in containers
- [ ] Add emojis to section headers
- [ ] Bold all labels, keep values regular
- [ ] Add separators between sections
- [ ] Update error format to Issue/Action pattern
- [ ] Use box-drawing chars for lists
- [ ] Add timestamps in Discord format
- [ ] Test with IsComponentsV2 flag
- [ ] Verify on mobile appearance

---

## 📚 Additional Resources

- [Discord Components V2 Docs](https://discord.com/developers/docs/interactions/message-components)
- [Discord.js Guide](https://discordjs.guide/)
- [Event System Documentation](../docs/EVENT_SYSTEM.md)

---

**Questions or suggestions?** Update this guide as the bot evolves!
