# Product Requirements Document (PRD)

**Product Name:** Loged.in  
**Version:** 1.0 (MVP)

## 1. Product Overview

### 1.1 Summary

Loged.in is a personal transformation logging platform where users can create multiple journeys, track progress through versioned logs, and optionally share their transformation publicly.
Each journey contains a timeline of entries ("versions") documenting how the user evolves over time — physically, financially, mentally, or in other domains.

The platform offers a Free plan with limitations and a Lifetime Pro one-time payment plan with unlimited access.

## 2. Goals & Objectives

### Primary Goals

- Provide users with a simple, beautiful way to document personal growth over time.
- Create a structured "versioning" system similar to software releases but applied to personal transformation.
- Enable users to share their journey publicly in a clean, aesthetic, and inspiring page.
- Simplify pricing into Free vs. Lifetime to improve conversion and ease of use.

### Secondary Goals

- Offer a low-friction onboarding experience ("Start logging in 30 seconds").
- Make each journey visually compelling to encourage reflection, commitment, and sharing.

## 3. Target Users

### Primary Users

- Fitness enthusiasts documenting body transformation
- Solopreneurs tracking income or career growth
- Developers or creators showcasing skill progression
- Anyone undergoing a long-term personal transformation

### Secondary Users

- Influencers sharing progress updates
- Coaches tracking client transformations
- People who want a private life journal

## 4. Key Product Concepts

### 4.1 Journeys

A journey is a transformation theme (e.g., "Body Transformation 2025", "From £0 to £100k", "Becoming a Developer").

Each journey has:

- Title
- Description
- Cover image (optional)
- Privacy setting (private/public)
- Timeline of versions

### 4.2 Versions (Logs)

Versions are chronological entries documenting progress.

Each version contains:

- Title (e.g., v1.2 – Down 5kg)
- Description/story
- Date
- Photos (upload)
- Tags (optional)

Displayed in a timeline-style view.

### 4.3 Public Journey Page

Each journey can be shared publicly using a clean, minimal layout:

`loged.in/@username/journey-name`

## 5. Feature Requirements

### 5.1 Authentication

- Continue with Google
- Continue with X (optional)

### 5.2 User Dashboard (Journeys Home)

#### Must Have

- List of all user journeys
- Create new journey button
- Display number of versions per journey
- Display last updated time
- Journey card click opens journey detail page

#### Nice-to-Have (Future)

- Drag-and-drop ordering of journeys
- Search/filter journeys

### 5.3 Journey Page

#### Must Have

- Journey title + description
- Cover image (optional)
- Add new version button
- List of versions in reverse chronological order
- Public/private toggle
- Clean shareable link
- Ability to edit/delete a journey

#### Nice-to-Have (Future)

- Progress indicators
- Charts for numeric transformations

### 5.4 Version Page (or Version Modal)

#### Must Have

- Version title
- Auto-generated version number (incremental)
- Description text field
- Photo upload(s)
- Date selector
- Tags
- Save button
- Ability to edit/delete

#### Nice-to-Have (Future)

- Before/after comparison tool
- AI Rewrite button (Pro)

### 5.5 Public Journey View

#### Must Have

- Read-only journey view
- Version timeline
- Photos + descriptions
- Footer attribution: "Made with Loged.in"
- SEO-friendly metadata
- Clean modern UI

#### Nice-to-Have

- Social share buttons
- Custom theme for Pro users

### 5.6 Pricing System

#### Free Plan

- 1 journey
- Up to 10 versions
- Loged.in watermark on public pages
- Basic theme

#### Lifetime Pro (One-Time Payment)

- Unlimited journeys
- Unlimited versions
- No watermark
- Custom themes
- Before/after comparison
- Priority support
- (Future) AI rewriting credits

### 5.7 Billing & Payment

- Stripe checkout (one-time payment)
- Store license status in user table
- Lock/free content based on plan

### 5.8 Settings

- Name
- Username
- Profile photo (optional)
- Delete account

## 6. Non-Functional Requirements

### 6.1 Performance

- Pages must load in <1s on desktop, <2s mobile
- Images optimized with automatic resizing

### 6.2 Security

- Account data stored securely
- Private journeys must be fully protected
- No public access without correct URL & permission

### 6.3 Availability

- Aim for >99% uptime
- Public journey pages must be highly cacheable

## 7. Technical Overview (Short)

### Stack (suggested)

- **Next.js** (Frontend + Backend routes)
- **Supabase + Postgres** (Database)
- **Supabase Storage** (Image uploads)
- **Stripe** (Payments)
- **Tailwind CSS** (Styling)

### Core Database Tables

- `users`
- `journeys`
- `versions`
- `photos`
- `payments`

## 8. Roadmap (MVP)

### Week 1 — Foundation

- Auth setup
- Basic database schema
- Create Journey flow
- Dashboard

### Week 2 — Journey + Version System

- Journey page
- Version page
- Public/private toggle
- Photo uploads

### Week 3 — Public Pages + Pricing

- Public journey page
- Free vs Pro limits
- Stripe integration
- Settings page

### Week 4 — Polish & Launch

- Landing page
- SEO + meta tags
- Bug fixing
- Deploy to Vercel

## 9. Success Metrics

### Primary

- DAU/WAU
- Number of journeys created
- Number of versions per journey
- Conversion rate to Lifetime Pro

### Secondary

- Number of public journey shares
- Engagement time on journey pages
