# **App Name**: JobScout

## Core Features:

- Job Listing Grid: Display job listings in a responsive grid of cards, showing job title, company, location, and post date.
- Search and Filter: Implement a top search bar to filter job listings by title, designation, or location.
- Job Details Page: Job detail page showing full job description and apply button. Only displays data fields that the API provides.
- API Aggregation: Securely fetch job listings from multiple job board APIs using Firebase Cloud Functions to hide API keys.
- AI Job Post Enricher: AI tool to enrich limited or ambiguous job postings from RapidAPI results. Based on existing information, and without direct data gathering or web lookups, provide suggestions of missing but probable/likely information like salary ranges, company ratings, etc.
- User Authentication: Implement Google Sign-In using Firebase Authentication.
- Analytics Dashboard: Display basic analytics like total jobs fetched, top locations, and common job roles, shown in a dashboard view.

## Style Guidelines:

- Primary color: Dusty Blue (#6B8EAC) for a professional and trustworthy feel.
- Background color: Very light gray (#F5F5F5), almost white.
- Accent color: Muted Red-Orange (#A0522D) for highlights and call-to-action buttons.
- Body and headline font: 'Inter', sans-serif, for a modern, objective look.
- Centered layout inspired by bankstatementconvertor.com with card-based styling and soft shadows.
- Use simple, outlined icons from a library like Feather or Tabler Icons for a clean look.
- Subtle transitions and hover effects on cards and buttons to enhance user interaction.