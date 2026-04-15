export type SalonMetric = {
  label: string;
  value: string;
  change: string;
  tone: "gold" | "green" | "blue" | "red";
};

export type GrowthSegment = {
  name: string;
  audience: string;
  rule: string;
  action: string;
  expectedRevenue: number;
  confidence: number;
};

export type WhatsAppTemplate = {
  title: string;
  message: string;
  variables: string[];
  useCase: string;
};

export type AutomationBlueprint = {
  name: string;
  trigger: string;
  delay: string;
  channel: string;
  outcome: string;
  status: "Live" | "Draft" | "Paused";
};

export type BusinessSetting = {
  label: string;
  value: string;
  description: string;
  category: "Access" | "Branch" | "Money" | "Brand" | "Security";
};

export const premiumKpis: SalonMetric[] = [
  { label: "CAC", value: "₹286", change: "-14% vs last month", tone: "green" },
  { label: "Repeat Rate", value: "68%", change: "+9% from retention flows", tone: "gold" },
  { label: "ARPU", value: "₹2,840", change: "+₹320 per customer", tone: "blue" },
  { label: "LTV", value: "₹18,700", change: "+22% VIP mix", tone: "green" },
  { label: "Churn Risk", value: "12%", change: "41 clients need follow-up", tone: "red" },
  { label: "Staff Utilization", value: "84%", change: "Peak load 5-8 PM", tone: "gold" },
  { label: "Offer ROI", value: "5.7x", change: "Birthday offer winning", tone: "green" },
  { label: "Empty Slot %", value: "16%", change: "18 recoverable slots", tone: "blue" },
];

export const smartSegments: GrowthSegment[] = [
  {
    name: "Haircut Comeback",
    audience: "25-35 days inactive haircut customers",
    rule: "Last service contains Haircut and days since visit >= 25",
    action: "Send Rahul stylist 10% comeback WhatsApp",
    expectedRevenue: 68000,
    confidence: 91,
  },
  {
    name: "Facial Reactivation",
    audience: "45+ days no facial clients",
    rule: "Preferred service Facial and last visit older than 45 days",
    action: "Send glow voucher + weekday slot recommendation",
    expectedRevenue: 42000,
    confidence: 84,
  },
  {
    name: "VIP Membership Upgrade",
    audience: "High spenders without Gold/Platinum",
    rule: "Total spend > ₹18,000 and membership is empty",
    action: "Offer Gold membership with priority booking",
    expectedRevenue: 115000,
    confidence: 88,
  },
  {
    name: "Academy Admissions Push",
    audience: "Instagram and website academy leads",
    rule: "Lead interest contains Academy and status not enrolled",
    action: "Send batch launch reminder + consultation CTA",
    expectedRevenue: 240000,
    confidence: 79,
  },
];

export const automationBlueprints: AutomationBlueprint[] = [
  {
    name: "24 Hour Booking Reminder",
    trigger: "Appointment starts tomorrow",
    delay: "24 hours before",
    channel: "WhatsApp + SMS fallback",
    outcome: "Reduce no-show risk by 31%",
    status: "Live",
  },
  {
    name: "2 Hour Premium Prep Reminder",
    trigger: "Appointment starts in two hours",
    delay: "2 hours before",
    channel: "WhatsApp",
    outcome: "Improve punctuality and slot hygiene",
    status: "Live",
  },
  {
    name: "Birthday Voucher",
    trigger: "Birthday tomorrow",
    delay: "9 AM local time",
    channel: "WhatsApp",
    outcome: "Drive high-emotion repeat visits",
    status: "Live",
  },
  {
    name: "Quote Follow-up",
    trigger: "No booking after consultation quote",
    delay: "2 days after quote",
    channel: "WhatsApp + staff task",
    outcome: "Recover undecided bridal/course leads",
    status: "Draft",
  },
];

export const whatsAppTemplates: WhatsAppTemplate[] = [
  {
    title: "Haircut Comeback",
    useCase: "Inactive haircut customers",
    variables: ["{Name}", "{Service}", "{DaysSinceVisit}", "{Stylist}", "{OfferCode}"],
    message:
      "Hi {Name}, it has been {DaysSinceVisit} days since your {Service}. Your stylist {Stylist} has a special 10% offer today only. Use {OfferCode} to book now.",
  },
  {
    title: "Birthday Voucher",
    useCase: "Birthday tomorrow/today",
    variables: ["{Name}", "{OfferCode}"],
    message:
      "Hi {Name}, happy birthday from AAR Salon. Enjoy a ₹300 gift voucher with code {OfferCode}. We would love to pamper you this week.",
  },
  {
    title: "Membership Renewal",
    useCase: "Expiring membership",
    variables: ["{Name}", "{OfferCode}"],
    message:
      "Hi {Name}, your Gold Membership expires tomorrow. Renew today with {OfferCode} to keep priority booking, cashback points, and VIP pricing active.",
  },
];

export const businessSettings: BusinessSetting[] = [
  {
    label: "Owner Access",
    value: "Full control",
    category: "Access",
    description: "Owner can manage billing, payroll, offers, security logs, and branch data.",
  },
  {
    label: "Reception Access",
    value: "Bookings + POS",
    category: "Access",
    description: "Reception can create bookings, checkout invoices, and send customer messages.",
  },
  {
    label: "GST",
    value: "18%",
    category: "Money",
    description: "Default GST rate applied to POS invoices and downloadable reports.",
  },
  {
    label: "Primary Branch",
    value: "AAR Salon HQ",
    category: "Branch",
    description: "Main branch used for dashboard revenue and occupancy targets.",
  },
  {
    label: "Brand Voice",
    value: "Premium warm luxury",
    category: "Brand",
    description: "Used for WhatsApp, SMS, review requests, and AI campaign copy.",
  },
  {
    label: "Security Logs",
    value: "Enabled",
    category: "Security",
    description: "Tracks sensitive admin actions, exports, billing changes, and role updates.",
  },
];

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const exportCsv = (filename: string, rows: Record<string, string | number>[]) => {
  const headers = Object.keys(rows[0] || { Status: "No data" });
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const estimateRevenuePlan = (target: number, current: number) => {
  const gap = Math.max(target - current, 0);
  return {
    gap,
    haircutCampaigns: Math.ceil(gap * 0.24),
    membershipPush: Math.ceil(gap * 0.31),
    academyAdmissions: Math.ceil(gap * 0.28),
    emptySlotRecovery: Math.ceil(gap * 0.17),
  };
};
