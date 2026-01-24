import { Events, AuditLogEvent, EmbedBuilder, ChannelType } from 'discord.js';
import { Event } from '../interfaces';
import ExtendedClient from '../classes/Client';

const MONITORED_ROLE_ID = '1456354643797086308';
const ALERT_ROLE_ID = '1454232274273959957';
const LOG_CHANNEL_ID = '1454639451924857017';

const event: Event = {
    name: Events.GuildAuditLogEntryCreate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (_client: ExtendedClient, auditLog: any, guild: any) => {
        try {
            const executor = auditLog.executor;

            // Check if the executor has the monitored role
            const member = await guild.members.fetch(executor.id).catch(() => null);

            if (!member) {
                return;
            }

            const hasMonitoredRole = member.roles.cache.has(MONITORED_ROLE_ID);

            if (!hasMonitoredRole) {
                return;
            }

            const alertRole = guild.roles.cache.get(ALERT_ROLE_ID);
            const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

            if (!alertRole || !logChannel || logChannel.type !== ChannelType.GuildText) {
                return;
            }

            // Remove the monitored role from the executor
            await member.roles.remove(MONITORED_ROLE_ID).catch(() => null);

            // Build the action description
            let actionDescription = '';
            let beforeValue = '';
            let afterValue = '';

            switch (auditLog.action) {
            case AuditLogEvent.ChannelDelete:
                actionDescription = `Deleted channel: **${auditLog.changes?.[0]?.old?.name || 'Unknown'}**`;
                beforeValue = 'Channel existed';
                afterValue = 'Channel deleted';
                break;

            case AuditLogEvent.ChannelCreate:
                actionDescription = `Created channel: **${auditLog.targetId}**`;
                beforeValue = 'Channel didn\'t exist';
                afterValue = 'Channel created';
                break;

            case AuditLogEvent.ChannelUpdate: {
                const changes = auditLog.changes || [];
                actionDescription = `Updated channel: **${auditLog.target?.name || 'Unknown'}**`;
                beforeValue = changes[0]?.old || 'N/A';
                afterValue = changes[0]?.new || 'N/A';
                break;
            }

            case AuditLogEvent.MessageDelete:
                actionDescription = `Deleted message in <#${auditLog.target?.id || 'Unknown'}>`;
                beforeValue = 'Message existed';
                afterValue = 'Message deleted';
                break;

            case AuditLogEvent.MessageBulkDelete:
                actionDescription = `Bulk deleted **${auditLog.extra?.count || '?'}** messages`;
                beforeValue = 'Messages existed';
                afterValue = 'Messages deleted';
                break;

            case AuditLogEvent.MemberKick:
                actionDescription = `Kicked member: **${auditLog.target?.tag || 'Unknown'}**`;
                beforeValue = 'Member was in guild';
                afterValue = 'Member kicked';
                break;

            case AuditLogEvent.MemberBanAdd:
                actionDescription = `Banned member: **${auditLog.target?.tag || 'Unknown'}**`;
                beforeValue = 'Member was in guild';
                afterValue = 'Member banned';
                break;

            case AuditLogEvent.MemberBanRemove:
                actionDescription = `Unbanned member: **${auditLog.target?.tag || 'Unknown'}**`;
                beforeValue = 'Member was banned';
                afterValue = 'Member unbanned';
                break;

            case AuditLogEvent.RoleCreate:
                actionDescription = `Created role: **${auditLog.target?.name || 'Unknown'}**`;
                beforeValue = 'Role didn\'t exist';
                afterValue = 'Role created';
                break;

            case AuditLogEvent.RoleDelete:
                actionDescription = `Deleted role: **${auditLog.changes?.[0]?.old?.name || 'Unknown'}**`;
                beforeValue = 'Role existed';
                afterValue = 'Role deleted';
                break;

            case AuditLogEvent.RoleUpdate:
                actionDescription = `Updated role: **${auditLog.target?.name || 'Unknown'}**`;
                beforeValue = auditLog.changes?.[0]?.old || 'N/A';
                afterValue = auditLog.changes?.[0]?.new || 'N/A';
                break;

            default:
                actionDescription = `Performed action: **${auditLog.action}** on ${auditLog.targetType}`;
                beforeValue = 'See audit logs';
                afterValue = 'Action completed';
            }

            // Create embed with comprehensive information
            const fields: any[] = [
                { name: '👤 Executed By', value: `${executor.tag} (${executor.id})`, inline: false },
                { name: '⚠️ Action Type', value: actionDescription, inline: false },
                { name: 'Before', value: `\`${beforeValue}\``, inline: true },
                { name: 'After', value: `\`${afterValue}\``, inline: true },
            ];

            // Add extra information if available
            if (auditLog.changes && auditLog.changes.length > 1) {
                const allChanges = auditLog.changes
                    .map((change: any) => `**${change.key}**: \`${change.old}\` → \`${change.new}\``)
                    .join('\n');
                fields.push({ name: 'All Changes', value: allChanges, inline: false });
            }

            if (auditLog.reason) {
                fields.push({ name: 'Reason', value: auditLog.reason, inline: false });
            }

            fields.push(
                { name: '🕐 Timestamp', value: `<t:${Math.floor(auditLog.createdTimestamp / 1000)}:F>`, inline: false },
                { name: '✅ Action Taken', value: 'Role removed from member', inline: true },
            );

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ UNAUTHORIZED ACTION DETECTED')
                .setDescription(`${alertRole}\n\nMember with <@&${MONITORED_ROLE_ID}> role performed a suspicious action!`)
                .addFields(fields)
                .setFooter({ text: `Guild: ${guild.name} | Role ID: ${MONITORED_ROLE_ID}` });

            await logChannel.send({ content: `${alertRole}`, embeds: [embed] });
        }
        catch (error) {
            console.error('[AUDIT MONITOR] Error in audit log monitor:', error);
        }
    },
};

export default event;
