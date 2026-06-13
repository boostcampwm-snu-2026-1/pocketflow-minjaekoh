# Pocketflow Concept & Feature Map

Pocketflow는 1인 가구의 지출 기록, 예정 지출, 현금흐름 예측, AI 소비 판단을 한 화면 흐름으로 연결하는 개인 재무 대시보드입니다.

## Legend

```text
[DONE]     현재 구현됨
[PARTIAL]  일부 구현됨
[PLANNED]  문서/폴더상 계획됨
```

## Concept Map

```text
+--------------------------------------------------------------------------------+
|                                  POCKETFLOW                                    |
|              1인 가구용 개인 재무 / 현금흐름 예측 대시보드                    |
+--------------------------------------------------------------------------------+
                                      |
          +---------------------------+---------------------------+
          |                           |                           |
          v                           v                           v
+----------------------+   +----------------------+   +----------------------+
| 지출 데이터           |   | 현금흐름 예측        |   | AI 소비 판단         |
| Expense Data          |   | Cashflow Forecasting |   | Purchase Analysis    |
+----------------------+   +----------------------+   +----------------------+
          |                           |                           |
          |                           |                           |
          v                           v                           v
+----------------------+   +----------------------+   +----------------------+
| Transaction           |   | Available Cash       |   | Item + Price Input   |
| - date                |   | Month-End Balance    |   | Available Cash       |
| - name                |   | Upcoming Outgoings   |   | Gemini Prompt        |
| - category            |   | Daily Projection     |   | Risk JSON Response   |
| - amount              |   | Chart Series         |   | Advice UI            |
+----------------------+   +----------------------+   +----------------------+
          |                           |                           |
          +---------------+-----------+---------------+-----------+
                          |                           |
                          v                           v
             +------------------------+   +------------------------+
             | 사용자 화면             |   | 외부/서버 흐름          |
             | User Experience        |   | Server & External API   |
             +------------------------+   +------------------------+
                          |                           |
                          v                           v
             +------------------------+   +------------------------+
             | Dashboard              |   | Next API Route          |
             | Expense Log            |   | Gemini API              |
             | Cashflow Setup         |   | Future Price API        |
             +------------------------+   +------------------------+
```

## Screen Concept Map

```text
Pocketflow
|
+-- [DONE] Common Shell
|   |
|   +-- Sidebar Navigation
|   +-- Top Header
|   +-- Dark Theme Layout
|
+-- [DONE] Home Dashboard (/)
|   |
|   +-- KPI Cards
|   +-- Daily Cashflow Chart
|   +-- Upcoming Expense Impact List
|   +-- AI Analysis Summary Panel
|
+-- [DONE] Expense Log (/expense-log)
|   |
|   +-- Expense Entry Form
|   +-- Recent Expense List
|   +-- Local Page State
|   +-- AI Purchase Simulator Panel
|
+-- [PARTIAL] AI Workflow
|   |
|   +-- Client Simulator Form
|   +-- POST /api/ai-purchase-simulator
|   +-- Gemini API Request
|   +-- JSON Result Parsing
|   +-- Risk / Advice Display
|
+-- [PLANNED] Cashflow Setup (/cashflow-setup)
    |
    +-- Fixed Expense List
    +-- Semi-Fixed Expense List
    +-- Detail Settings Panel
```

## Feature Map

```text
Pocketflow Feature Map
|
+-- 1. Common App Shell [DONE]
|   |
|   +-- Sidebar Navigation
|   |   |
|   |   +-- Dashboard Link
|   |   +-- Expense Log Link
|   |   +-- Cashflow Setup Link
|   |
|   +-- Top Header
|   |   |
|   |   +-- User Summary
|   |   +-- Notification Button
|   |   +-- Settings Button
|   |
|   +-- Global Dark Theme
|
+-- 2. Dashboard [DONE]
|   |
|   +-- KPI Cards
|   |   |
|   |   +-- Available Cash Today
|   |   +-- Forecast Month-End Balance
|   |   +-- Budget Usage Rate
|   |   +-- Planned Expenses This Month
|   |
|   +-- Daily Cashflow Chart
|   |   |
|   |   +-- 30-Day Cash Projection
|   |   +-- Upcoming Expense Deductions
|   |   +-- Recharts Tooltip
|   |   +-- Starting Cash Reference Line
|   |
|   +-- Upcoming Cashflow Impact List
|   |   |
|   |   +-- D-Day Expense Items
|   |   +-- Category Badges
|   |   +-- Remaining Cash After Each Expense
|   |   +-- Urgent Expense Warning
|   |
|   +-- AI Analysis Summary Panel
|       |
|       +-- Current Spending Status
|       +-- Risk Memo
|       +-- Cash Insight Rows
|
+-- 3. Expense Log [DONE]
|   |
|   +-- Expense Entry Form
|   |   |
|   |   +-- Date Input
|   |   +-- Item Name Input
|   |   +-- Amount Input
|   |   +-- Category Select
|   |   +-- Required Field Validation
|   |   +-- Numeric Amount Validation
|   |
|   +-- Recent Expense List
|   |   |
|   |   +-- Expense Date
|   |   +-- Item Name
|   |   +-- Category Badge
|   |   +-- Amount
|   |   +-- Total Recent Spending
|   |
|   +-- Local Page State
|   |   |
|   |   +-- Add New Expense
|   |   +-- Re-sort Recent Expenses
|   |   +-- Pass Latest Expense To Simulator
|   |
|   +-- AI Purchase Simulator
|       |
|       +-- Purchase Item Input
|       +-- Price Input
|       +-- Available Cash Context
|       +-- Loading State
|       +-- Error State
|       +-- Analysis Result
|           |
|           +-- Risk Level: safe / watch / danger
|           +-- Headline
|           +-- Summary
|           +-- Remaining Cash
|           +-- Advice
|
+-- 4. AI API [PARTIAL]
|   |
|   +-- POST /api/ai-purchase-simulator
|   |   |
|   |   +-- Read itemName / price / availableCash
|   |   +-- Validate Request
|   |   +-- Build Finance Prompt
|   |   +-- Call Gemini API
|   |   +-- Extract Text Response
|   |   +-- Return Result To Client
|   |
|   +-- Environment Variables
|       |
|       +-- GEMINI_API_KEY
|       +-- GOOGLE_API_KEY
|
+-- 5. Cashflow Setup [PLANNED]
|   |
|   +-- Fixed Expense List
|   |   |
|   |   +-- Rent
|   |   +-- Maintenance Fee
|   |   +-- Phone Bill
|   |   +-- Monthly Amount
|   |   +-- Next Payment Date
|   |
|   +-- Semi-Fixed Expense List
|   |   |
|   |   +-- Recurring Purchase Items
|   |   +-- Billing Cycle
|   |   +-- Next Payment Date
|   |   +-- API-Linked Badge
|   |
|   +-- Detail Settings Panel
|       |
|       +-- Selected Item Details
|       +-- Edit Amount
|       +-- Edit Cycle
|       +-- Edit Next Payment Date
|       +-- Smart Pricing Toggle
|
+-- 6. Forecasting [PLANNED]
|   |
|   +-- Cashflow Calculation
|   +-- Month-End Balance Prediction
|   +-- Chart Data Regeneration
|   +-- Dashboard Recalculation
|
+-- 7. Smart Pricing [PLANNED]
|   |
|   +-- External Price API
|   +-- Cheapest Price Lookup
|   +-- Semi-Fixed Expense Recalculation
|   +-- Price Update Status
|
+-- 8. Global State [PLANNED]
    |
    +-- Zustand Store
        |
        +-- Transactions
        +-- Subscriptions
        +-- Cashflow Summary
        +-- AI Analysis State
```

## Data Flow Map

```text
Expense Entry
|
+-- User inputs date / name / amount / category
|
+-- Form validates required fields and numeric amount
|
+-- ExpenseLogPageShell stores item in local React state
|
+-- RecentExpenseList re-renders with latest item
|
+-- AiPurchaseSimulatorPanel receives latest item name and amount
|
+-- User requests analysis
    |
    +-- Client POSTs to /api/ai-purchase-simulator
    |
    +-- API route builds Gemini prompt
    |
    +-- Gemini returns strict JSON text
    |
    +-- Client parses response
    |
    +-- UI displays risk level, remaining cash, and advice
```

## Layer Map

```text
src/app
|
+-- Routes and page composition
+-- API route

src/features
|
+-- Dashboard feature components
+-- Expense log feature components
+-- Future cashflow setup / forecasting / smart-pricing features

src/entities
|
+-- Transaction domain model placeholder
+-- Subscription domain model placeholder
+-- Cashflow domain model placeholder

src/shared
|
+-- Layout components
+-- Navigation config
+-- Utility functions
+-- Shared UI and type placeholders

src/store
|
+-- Future Zustand state layer
```

## Current Implementation Snapshot

```text
Implemented
|
+-- Next.js app shell
+-- Dashboard UI
+-- Expense log UI
+-- Local expense state
+-- AI simulator client panel
+-- Gemini-backed API route

Not Yet Implemented
|
+-- Cashflow setup real page
+-- Zustand global store
+-- Entity model implementation
+-- Persistent database layer
+-- Forecast recalculation from real transactions
+-- Smart pricing external API integration
```

## Goblin Room Concept Notes

```text
AI Purchase Simulator
|
+-- Frame the experience as a group-chat judgment room
+-- Use blunt but practical spending warnings
+-- Return a verdict, member votes, and short chat-style replies
+-- Keep the tone playful without shaming the user personally
+-- Prefer "hold / reject / buy" style outcomes over formal finance language
```
