import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { ScheduleItem } from "@/store/visionStore";

export interface PlanData {
  goalText: string;
  motivations: string[];
  schedule: ScheduleItem[];
  createdAt?: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generatePlanHTML(data: PlanData): string {
  const { goalText, motivations, schedule, createdAt } = data;
  const dateStr = new Date(createdAt || Date.now()).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasMotivations = motivations && motivations.length > 0;
  const hasSchedule = schedule && schedule.length > 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: white;
            padding: 40px;
            color: #333;
          }
          .container { max-width: 600px; margin: 0 auto; }
          .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #333;
          }
          .header h1 { font-size: 28px; font-weight: 800; color: #000; margin-bottom: 8px; }
          .header .subtitle { color: #666; font-size: 14px; }
          .header .date {
            color: #333;
            font-weight: 600;
            font-size: 12px;
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .section { margin-bottom: 28px; }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #000;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ccc;
          }
          .motivation-list { list-style: none; }
          .motivation-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .motivation-item:last-child { border-bottom: none; }
          .check-icon { font-weight: bold; color: #333; flex-shrink: 0; }
          .motivation-text { color: #333; line-height: 1.5; font-size: 14px; }
          .schedule-card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
          }
          .schedule-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .schedule-time { font-size: 16px; font-weight: 700; color: #000; }
          .schedule-type {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            border: 1px solid #999;
            padding: 2px 8px;
            border-radius: 4px;
          }
          .schedule-task { font-size: 14px; color: #333; margin-bottom: 10px; }
          .days-row { display: flex; gap: 6px; }
          .day {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            border: 1px solid #999;
          }
          .day.active { background: #333; color: white; border-color: #333; }
          .day.inactive { background: white; color: #999; }
          .tracker-section { margin-bottom: 28px; }
          .tracker-title {
            font-size: 16px;
            font-weight: 700;
            color: #000;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ccc;
          }
          .tracker-grid { display: flex; flex-direction: column; gap: 8px; }
          .tracker-week { display: flex; align-items: center; gap: 6px; }
          .week-label { font-size: 10px; color: #666; width: 45px; flex-shrink: 0; }
          .tracker-days { display: flex; gap: 4px; }
          .tracker-circle {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1px solid #999;
            background: white;
          }
          .month-label { font-size: 11px; font-weight: 600; color: #333; margin-bottom: 8px; }
          .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #ccc;
            font-size: 11px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${goalText}</h1>
            <p class="subtitle">Personal Action Plan</p>
            <p class="date">Created ${dateStr}</p>
          </div>

          ${hasMotivations ? `
          <div class="section">
            <h2 class="section-title">Why You're Doing This</h2>
            <ul class="motivation-list">
              ${motivations.map(m => `
                <li class="motivation-item">
                  <span class="check-icon">✓</span>
                  <span class="motivation-text">${m}</span>
                </li>
              `).join("")}
            </ul>
          </div>
          ` : ""}

          ${hasSchedule ? `
          <div class="section">
            <h2 class="section-title">The Regimen</h2>
            ${schedule.map(item => `
              <div class="schedule-card">
                <div class="schedule-header">
                  <span class="schedule-time">${item.time}</span>
                  <span class="schedule-type">${item.type}</span>
                </div>
                <p class="schedule-task">${item.task}</p>
                <div class="days-row">
                  ${DAY_NAMES.map((day, idx) => `
                    <span class="day ${item.activeDays.includes(idx) ? "active" : "inactive"}">${day.charAt(0)}</span>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
          ` : ""}

          <div class="tracker-section">
            <h2 class="tracker-title">30-Day Progress Tracker</h2>
            <p class="month-label">Mark each circle as you complete your daily tasks ○ → ●</p>
            <div class="tracker-grid">
              ${[1, 2, 3, 4].map(week => `
                <div class="tracker-week">
                  <span class="week-label">Week ${week}</span>
                  <div class="tracker-days">
                    ${Array(7).fill(0).map(() => '<span class="tracker-circle"></span>').join("")}
                  </div>
                </div>
              `).join("")}
              <div class="tracker-week">
                <span class="week-label">Week 5</span>
                <div class="tracker-days">
                  ${Array(2).fill(0).map(() => '<span class="tracker-circle"></span>').join("")}
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Generated by Vision Board • Now get to work! 💪</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function generatePlanPDF(data: PlanData): Promise<void> {
  const html = generatePlanHTML(data);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share your plan",
      UTI: "com.adobe.pdf",
    });
  }
}
