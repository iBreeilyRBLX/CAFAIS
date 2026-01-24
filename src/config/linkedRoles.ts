/* eslint-disable no-inline-comments */
/**
 * Linked Roles Configuration
 *
 * This file defines role hierarchies where parent roles are automatically granted
 * when a user receives any role from a defined set of child roles.
 *
 * Example:
 * If a user receives the "Infantry" role (child), they automatically get the "Groups" role (parent)
 */

export interface LinkedRoleSet {
    /** The parent role ID that will be granted */
    parentRoleId: string;
    /** The parent role name (for display purposes) */
    parentRoleName: string;
    /** Array of child role IDs - having ANY of these grants the parent role */
    childRoleIds: string[];
    /** Description of this role set */
    description?: string;
}

/**
 * Define your linked role sets here
 *
 * Each set has:
 * - parentRoleId: The role that gets automatically assigned
 * - parentRoleName: Display name for logging
 * - childRoleIds: Array of roles that trigger the parent role assignment
 * - description: Optional description
 */
export const linkedRoleSets: LinkedRoleSet[] = [
    // HICOM roles
    {
        parentRoleId: '1454232274273959957',
        parentRoleName: 'High command Personal',
        childRoleIds: [
            '1454231933994274900', // Bot Developer
            '1454231103425613874', // Prime Executive
            '1454232393451048960', // Marshal
            '1454246002667159713', // General
            '1454246064671690772', // Lieutenant General
        ],
        description: 'High Command ranks',
    },
    // Officer roles
    {
        parentRoleId: '1454247683815506163',
        parentRoleName: 'Officer Role',
        childRoleIds: [
            '1454246615362830469', // Commander
            '1454247249117843497', // Captain
            '1454247316436418794', // Lieutenant
            '1454247524159324201', // Junior Lieutenant
            '1454247629277106367', // Officer Cadet
        ],
        description: 'Officer ranks',
    },
    // NCO roles
    {
        parentRoleId: '1454248254555295856',
        parentRoleName: 'NCO Role',
        childRoleIds: [
            '1454247772164329676', // Command Chief
            '1454247839608602735', // Chief First Class
            '1454247896697409690', // Chief Second Class
            '1454247959834263643', // Superior Sergeant
            '1454248031024320674', // Senior Sergeant
            '1454248110845857954', // Sergeant
            '1454248188016988382', // Junior Sergeant
        ],
        description: 'Non-commissioned officer ranks',
    },
    // Enlisted roles
    {
        parentRoleId: '1454248973824033039',
        parentRoleName: 'Enlisted Role',
        childRoleIds: [
            '1454248351724736654', // Corporal
            '1454248409463656511', // Lance Corporal
            '1454248467282006078', // Superior Private
            '1454248608307351664', // Senior Private
            '1454248722891407472', // Private
            // '1454248763915898971', // Initiate
        ],
        description: 'Enlisted ranks',
    },
    {
        parentRoleId: '1454533624379605096',
        parentRoleName: 'CASF Personal',
        childRoleIds: [
            '1454248973824033039', // Enlisted
            '1454248254555295856', // NCO
            '1454247683815506163', // Officers
            '1454232274273959957', // High com
        ],
        description: 'Events Team Roles',
    },
    // {
    //     parentRoleId: '1454640375305211975',
    //     parentRoleName: 'Lore department',
    //     childRoleIds: [
    //         '1454640551793000679', // Lore Director
    //         '1456942856445886525', // Lore Producer
    //         '1454640507773780159', // Lore Writer
    //         '1454640471195386047', // Lore department
    //     ],
    //     description: 'Lore department Separator',
    // },
    // {
    //     parentRoleId: '1454640471195386047',
    //     parentRoleName: 'Lore Department Role',
    //     childRoleIds: [
    //         '1454640375305211975', // Lore Department Separator
    //     ],
    //     description: 'Lore department Role',
    // },
    // {
    //     parentRoleId: '1454539090832789638',
    //     parentRoleName: 'Training department',
    //     childRoleIds: [
    //         '1454538951321976995', // Chief Learning Officer
    //         '1454539173703716978', // Chief Academy Instructor
    //         '1454538898498912377', // Academy Instructor
    //         '1454538872213213379', // Assistant Instructor
    //         '1454538513981767774', // Training Department
    //     ],
    //     description: 'Lore department Role',
    // },
    // {
    //     parentRoleId: '1454538513981767774',
    //     parentRoleName: 'Training Department Role',
    //     childRoleIds: [
    //         '1454539090832789638', // Training Department Separator
    //     ],
    //     description: 'Training department Role',
    // },

    // {
    //     parentRoleId: '1454538343730909296',
    //     parentRoleName: 'Moderation department',
    //     childRoleIds: [
    //         '1454538643053084693', // Head Moderator
    //         '1454538608861253794', // Moderator
    //         '1454538446029983744', // Moderation Department
    //     ],
    //     description: 'Moderation department Role',
    // },
    // {
    //     parentRoleId: '1454538446029983744',
    //     parentRoleName: 'Moderation Department Role',
    //     childRoleIds: [
    //         '1454538343730909296', // Training Department Separator
    //     ],
    //     description: 'Moderation department Role',
    // },
];

/**
 * Get all parent role IDs for quick lookup
 */
export function getAllParentRoleIds(): string[] {
    return linkedRoleSets.map(set => set.parentRoleId);
}

/**
 * Get all child role IDs for quick lookup
 */
export function getAllChildRoleIds(): string[] {
    return linkedRoleSets.flatMap(set => set.childRoleIds);
}

/**
 * Find which parent role(s) a child role should grant
 */
export function getParentRolesForChild(childRoleId: string): LinkedRoleSet[] {
    return linkedRoleSets.filter(set => set.childRoleIds.includes(childRoleId));
}

/**
 * Check if a role ID is a child role in any set
 */
export function isChildRole(roleId: string): boolean {
    return linkedRoleSets.some(set => set.childRoleIds.includes(roleId));
}

/**
 * Check if a role ID is a parent role in any set
 */
export function isParentRole(roleId: string): boolean {
    return linkedRoleSets.some(set => set.parentRoleId === roleId);
}
