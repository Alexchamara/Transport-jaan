import React from "react";

const actionConfig = {
    vendor_submitted: { icon: '📝', color: 'text-[#5B8DEF]', bgColor: 'bg-[#0E43FB20]' },
    vendor_resubmitted: { icon: '🔄', color: 'text-[#FDB52A]', bgColor: 'bg-[#FDB52A20]' },
    service_approved: { icon: '✅', color: 'text-[#14CA74]', bgColor: 'bg-[#05C16820]' },
    service_rejected: { icon: '❌', color: 'text-[#FF4757]', bgColor: 'bg-[#FF475720]' },
    service_revision_requested: { icon: '📋', color: 'text-[#FDB52A]', bgColor: 'bg-[#FDB52A20]' },
    all_services_approved: { icon: '🎉', color: 'text-[#14CA74]', bgColor: 'bg-[#05C16820]' },
    all_services_rejected: { icon: '🚫', color: 'text-[#FF4757]', bgColor: 'bg-[#FF475720]' },
    revision_requested: { icon: '↩️', color: 'text-[#FDB52A]', bgColor: 'bg-[#FDB52A20]' },
    vendor_blocked: { icon: '🔒', color: 'text-[#FF4757]', bgColor: 'bg-[#FF475720]' },
    vendor_unblocked: { icon: '🔓', color: 'text-[#14CA74]', bgColor: 'bg-[#05C16820]' },
    note_added: { icon: '📌', color: 'text-[#AEB9E1]', bgColor: 'bg-[#AEB9E120]' },
    vendor_auto_verified: { icon: '⭐', color: 'text-[#14CA74]', bgColor: 'bg-[#05C16820]' },
};

const defaultConfig = { icon: '📄', color: 'text-[#AEB9E1]', bgColor: 'bg-[#AEB9E120]' };

const ActivityTimeline = ({ activityLogs }) => {
    if (!activityLogs || activityLogs.length === 0) {
        return (
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <p className="text-[#AEB9E1] text-[14px] text-center py-8">
                    No activity recorded yet.
                </p>
            </div>
        );
    }

    const groupByDate = (logs) => {
        const groups = {};
        logs.forEach((log) => {
            const date = log.created_at_date || new Date(log.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    };

    const groupedLogs = groupByDate(activityLogs);

    return (
        <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, logs]) => (
                <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-[1px] flex-1 bg-[#343B4F]" />
                        <span className="text-[#AEB9E1] text-[11px] font-[600] uppercase tracking-wider flex-shrink-0">{date}</span>
                        <div className="h-[1px] flex-1 bg-[#343B4F]" />
                    </div>

                    <div className="space-y-1">
                        {logs.map((log) => {
                            const config = actionConfig[log.action] || defaultConfig;

                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#0B1739]/60 transition-colors"
                                >
                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0 text-[14px]`}>
                                        {config.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[#E0E6F7] text-[13px] leading-snug">{log.description}</p>
                                        {log.metadata?.admin_notes && (
                                            <div className="mt-1 bg-[#081028] border border-[#343B4F] rounded px-2.5 py-1.5">
                                                <span className="text-[#AEB9E1] text-[11px] italic">"{log.metadata.admin_notes}"</span>
                                            </div>
                                        )}
                                        {log.metadata?.target_name && (
                                            <span className="text-[#5B8DEF] text-[11px]">
                                                {log.metadata.target_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Admin & Time */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[#AEB9E1] text-[11px]">{log.admin?.name || 'System'}</p>
                                        <p className="text-[#AEB9E1]/60 text-[10px]">{log.created_at_time || ''}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
