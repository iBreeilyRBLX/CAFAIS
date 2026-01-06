/* eslint-disable no-inline-comments */
// src/ranks/ranks.ts
// Template for 24 ranks. Fill in actual Discord role IDs and names as needed.

export interface Rank {
  name: string;
  prefix: string;
  discordRoleId: string;
    permissionSet: string;
    /** Maximum rank prefix this rank can promote users to (undefined = can promote to any rank below their own) */
    maxPromoteToPrefix?: string;
}

export const ranks: Rank[] = [
    // HICOM: PRX, MAR, GEN, LTG (can promote to any rank)
    { name: 'Bot Devloper', prefix: 'BOT', discordRoleId: '1454231933994274900', permissionSet: '/rank-permissions/bot-dev.json' },
    { name: 'Prime Executive', prefix: 'PRX', discordRoleId: '1454231103425613874', permissionSet: '/rank-permissions/hicom.json' },
    { name: 'Marshal', prefix: 'MAR', discordRoleId: '1454232393451048960', permissionSet: '/rank-permissions/hicom.json' },
    { name: 'General', prefix: 'GEN', discordRoleId: '1454246002667159713', permissionSet: '/rank-permissions/hicom.json' },
    { name: 'Lieutenant General', prefix: 'LTG', discordRoleId: '1454246064671690772', permissionSet: '/rank-permissions/hicom.json' },
    // Officers: CMD, CPT, LTT, JLT
    // Commander can promote up to Senior Sergeant
    { name: 'Commander', prefix: 'CMD', discordRoleId: '1454246615362830469', permissionSet: '../rank-permissions/officer.json', maxPromoteToPrefix: 'SSG' },
    // Captain can promote up to Sergeant
    { name: 'Captain', prefix: 'CPT', discordRoleId: '1454247249117843497', permissionSet: '../rank-permissions/officer.json', maxPromoteToPrefix: 'SGT' },
    // Lieutenant can promote up to Junior Sergeant
    { name: 'Lieutenant', prefix: 'LTT', discordRoleId: '1454247316436418794', permissionSet: '../rank-permissions/officer.json', maxPromoteToPrefix: 'JSG' },
    // Junior Lieutenant can promote up to Corporal
    { name: 'Junior Lieutenant', prefix: 'JLT', discordRoleId: '1454247524159324201', permissionSet: '../rank-permissions/officer.json', maxPromoteToPrefix: 'CPL' },
    // NCOs: CCH, CH1, CH2, SPS, SSG, SGT, JSG
    // Command Chief can promote up to Junior Sergeant
    { name: 'Command Chief', prefix: 'CCH', discordRoleId: '1454247772164329676', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'JSG' },
    // Chief First Class can promote up to Corporal
    { name: 'Chief First Class', prefix: 'CH1', discordRoleId: '1454247839608602735', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'CPL' },
    // Chief Second Class can promote up to Lance Corporal
    { name: 'Chief Second Class', prefix: 'CH2', discordRoleId: '1454247896697409690', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'LCP' },
    // Superior Sergeant can promote up to Superior Private
    { name: 'Superior Sergeant', prefix: 'SPS', discordRoleId: '1454247959834263643', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'SSP' },
    // Senior Sergeant can promote up to Senior Private
    { name: 'Senior Sergeant', prefix: 'SSG', discordRoleId: '1454248031024320674', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'SPV' },
    // Sergeant can promote up to Senior Private
    { name: 'Sergeant', prefix: 'SGT', discordRoleId: '1454248110845857954', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'SPV' },
    // Junior Sergeant can promote up to Senior Private
    { name: 'Junior Sergeant', prefix: 'JSG', discordRoleId: '1454248188016988382', permissionSet: '../rank-permissions/nco.json', maxPromoteToPrefix: 'SPV' },
    // Enlisted: CPL, LCP, SSP, SPV, PVT, INT (cannot promote)
    { name: 'Corporal', prefix: 'CPL', discordRoleId: '1454248351724736654', permissionSet: '../rank-permissions/enlisted.json' },
    { name: 'Lance Corporal', prefix: 'LCP', discordRoleId: '1454248409463656511', permissionSet: '../rank-permissions/enlisted.json' },
    { name: 'Superior Private', prefix: 'SSP', discordRoleId: '1454248467282006078', permissionSet: '../rank-permissions/enlisted.json' },
    { name: 'Senior Private', prefix: 'SPV', discordRoleId: '1454248608307351664', permissionSet: '../rank-permissions/enlisted.json' },
    { name: 'Private', prefix: 'PVT', discordRoleId: '1454248722891407472', permissionSet: '../rank-permissions/enlisted.json' },
    { name: 'Initiate', prefix: 'INT', discordRoleId: '1454248763915898971', permissionSet: '../rank-permissions/enlisted.json' },
];
