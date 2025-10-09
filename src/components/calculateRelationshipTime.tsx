import React from "react";

interface RelationshipCalculatorProps {
  startDate: string;
}
const RelationshipCalculator: React.FC<RelationshipCalculatorProps> = ({
  startDate,
}) => {
  const calculateRelationshipTime = (): string => {
    if (!startDate) return "";

    const start = new Date(startDate);
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ano${years > 1 ? "s" : ""}`);
    if (months > 0) {
    if (months > 0) {
  parts.push(months === 1 ? `${months} mês` : `${months} meses`);
}

    if (days > 0 || parts.length === 0)
      parts.push(`${days} dia${days > 1 ? "s" : ""}`);

    return parts.join(", ");
  };

  const relationshipTime = calculateRelationshipTime();

  if (!relationshipTime) return null;
};

export default RelationshipCalculator;