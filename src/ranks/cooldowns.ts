// src/ranks/cooldowns.ts
// Central place to configure time-in-rank cooldowns and point requirements.
// All cooldowns are in DAYS. Points are arbitrary units; align with your tracking system.

export type RankRequirement = {
    cooldownDays: number;
    minPoints: number;
};

export const rankRequirements: Record<string, RankRequirement> = {
    // HICOM
    PRX: { cooldownDays: 0, minPoints: 0 },
    MAR: { cooldownDays: 0, minPoints: 0 },
    GEN: { cooldownDays: 0, minPoints: 0 },
    LTG: { cooldownDays: 0, minPoints: 0 },

    // Officers
    CMD: { cooldownDays: 7, minPoints: 250 },
    CPT: { cooldownDays: 7, minPoints: 200 },
    LTT: { cooldownDays: 5, minPoints: 170 },
    JLT: { cooldownDays: 5, minPoints: 150 },

    // NCOs
    CCH: { cooldownDays: 4, minPoints: 130 },
    CH1: { cooldownDays: 4, minPoints: 120 },
    CH2: { cooldownDays: 3, minPoints: 110 },
    SPS: { cooldownDays: 3, minPoints: 100 },
    SSG: { cooldownDays: 3, minPoints: 90 },
    SGT: { cooldownDays: 2, minPoints: 75 },
    JSG: { cooldownDays: 2, minPoints: 60 },

    // Enlisted
    CPL: { cooldownDays: 2, minPoints: 45 },
    LCP: { cooldownDays: 1.5, minPoints: 35 },
    SSP: { cooldownDays: 1, minPoints: 4 },
    SPV: { cooldownDays: 1, minPoints: 4 },
    PVT: { cooldownDays: 0, minPoints: 0 },
    INT: { cooldownDays: 0.25, minPoints: 0 },
};

// Usage idea (example): when promoting from rank X, ensure the member has been in-rank
// for at least cooldownDays (convert to milliseconds/days as needed) AND meets minPoints.
