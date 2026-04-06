import { ActionType, Category, Severity } from '@/types';

interface ActionBadgeProps {
  action: ActionType;
  category?: Category;
  severity?: Severity;
}

export default function ActionBadge({ action, category, severity }: ActionBadgeProps) {
  const getCategoryColor = (cat?: Category): string => {
    switch (cat) {
      case 'style':
        return '#60a5fa';
      case 'logic':
        return '#fbbf24';
      case 'security':
        return '#f87171';
      default:
        return '#6b7280';
    }
  };

  const getSeverityColor = (sev?: Severity): string => {
    switch (sev) {
      case 'high':
        return '#f87171';
      case 'medium':
        return '#fbbf24';
      case 'low':
        return '#60a5fa';
      default:
        return '#6b7280';
    }
  };

  const getActionColor = (act: ActionType): string => {
    switch (act) {
      case 'approve':
        return '#34d399';
      case 'request_changes':
        return '#f87171';
      case 'flag_line':
        return '#fbbf24';
      case 'add_comment':
        return '#60a5fa';
      default:
        return '#6b7280';
    }
  };

  const formatLabel = (str: string): string => {
    return str.replace(/_/g, ' ').toUpperCase();
  };

  if (category) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
        style={{
          backgroundColor: getCategoryColor(category) + '20',
          color: getCategoryColor(category),
          border: `1px solid ${getCategoryColor(category)}40`,
        }}
      >
        {category}
      </span>
    );
  }

  if (severity) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
        style={{
          backgroundColor: getSeverityColor(severity) + '20',
          color: getSeverityColor(severity),
          border: `1px solid ${getSeverityColor(severity)}40`,
        }}
      >
        {severity}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{
        backgroundColor: getActionColor(action) + '20',
        color: getActionColor(action),
        border: `1px solid ${getActionColor(action)}40`,
      }}
    >
      {formatLabel(action)}
    </span>
  );
}
