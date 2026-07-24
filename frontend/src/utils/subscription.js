/**
 * Calculate remaining access days for a doctor out of 365 days.
 * Returns a number between 0 and 365, or Infinity for Super Admin.
 */
export const getRemainingAccessDays = (doctorData) => {
  if (!doctorData) return 0;

  // Super Admin has unrestricted lifetime access
  const role = String(doctorData.role || '').toLowerCase();
  if (role.includes('super admin')) {
    return Infinity;
  }

  let expiryTime;
  if (doctorData.subscriptionExpiry) {
    expiryTime = new Date(doctorData.subscriptionExpiry).getTime();
  } else if (doctorData.createdAt) {
    expiryTime = new Date(doctorData.createdAt).getTime() + (365 * 24 * 60 * 60 * 1000);
  } else {
    return 365;
  }

  const now = new Date().getTime();
  const diffMs = expiryTime - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? Math.min(days, 365) : 0;
};

/**
 * Returns helper styling/warning info based on remaining days.
 */
export const getSubscriptionInfo = (doctorData) => {
  if (!doctorData) return null;

  const role = String(doctorData.role || '').toLowerCase();
  const isSuperAdmin = role.includes('super admin');

  if (isSuperAdmin) {
    return {
      daysRemaining: Infinity,
      isWarning: false,
      isExpired: false,
      isSuperAdmin: true,
      statusText: 'Lifetime Access (Super Admin)',
      badgeClass: 'badge-gold',
      textColor: '#16a34a',
    };
  }

  const daysRemaining = getRemainingAccessDays(doctorData);
  const isWarning = daysRemaining <= 5;
  const isExpired = daysRemaining <= 0;

  return {
    daysRemaining,
    isWarning,
    isExpired,
    isSuperAdmin: false,
    statusText: isExpired
      ? 'Subscription Expired'
      : isWarning
      ? `Warning: ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} access remaining`
      : `${daysRemaining} days access remaining`,
    badgeClass: isExpired ? 'badge-red' : isWarning ? 'badge-red' : 'badge-gold',
    textColor: isWarning ? '#ef4444' : '#1d4ed8',
  };
};
