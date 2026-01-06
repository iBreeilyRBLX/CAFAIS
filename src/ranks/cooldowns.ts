// src/ranks/cooldowns.ts
// Central place to configure time-in-rank cooldowns and point requirements.
// All cooldowns are in DAYS. Points are arbitrary units; align with your tracking system.

export type RankRequirement = {
    cooldownDays: number;
    minPoints: number;
};

export const rankRequirements: Record<string, RankRequirement> = {
    // HICOM (High Command)
    PRX: { cooldownDays: 0, minPoints: 0 },
    MAR: { cooldownDays: 0, minPoints: 0 },
    GEN: { cooldownDays: 0, minPoints: 0 },
    LTG: { cooldownDays: 0, minPoints: 0 },

    // Officers
    CMD: { cooldownDays: 5, minPoints: 150 },
    CPT: { cooldownDays: 5, minPoints: 120 },
    LTT: { cooldownDays: 4, minPoints: 100 },
    JLT: { cooldownDays: 4, minPoints: 90 },

    // NCOs
    CCH: { cooldownDays: 3, minPoints: 75 },
    CH1: { cooldownDays: 3, minPoints: 65 },
    CH2: { cooldownDays: 2, minPoints: 60 },
    SPS: { cooldownDays: 2, minPoints: 50 },
    SSG: { cooldownDays: 2, minPoints: 40 },
    SGT: { cooldownDays: 21, minPoints: 35 },
    JSG: { cooldownDays: 21, minPoints: 25 },

    // Enlisted
    CPL: { cooldownDays: 14, minPoints: 20 },
    LCP: { cooldownDays: 14, minPoints: 10 },
    SSP: { cooldownDays: 7, minPoints: 3 },
    SPV: { cooldownDays: 7, minPoints: 7 },
    PVT: { cooldownDays: 0, minPoints: 0 },
    INT: { cooldownDays: 0, minPoints: 0 },
};

// Point calculation: 2 points per 1-hour event, +1 point for every 30 mins beyond the first hour

// Usage idea (example): when promoting from rank X, ensure the member has been in-rank
// for at least cooldownDays (convert to milliseconds/days as needed) AND meets minPoints.
