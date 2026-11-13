# Frontend Change Summary

This document covers frontend changes only. Backend and database changes are not included.

## Crop Catalogue

- Search updates as text is entered and matches the beginning of crop-name words.
- Search-only Tagalog aliases find the corresponding English crop card; the aliases do not change crop card titles. Examples include `mais` for Corn, `talong` for Eggplant, and `kalabasa` for Squash.
- Clicking a crop image opens a square popup with the full image above a centered title and readable description. The popup closes with its close button, Escape, or a click on the backdrop.
- See [catalogue page](./src/app/crops/page.js) and [catalogue styles](./src/app/crops/crops.module.css).

## Dashboard

- The Total Plans, Growing, Harvested, and Completed cards open summaries based on the current account's plans.
- Summaries show matching plans or an empty state, and link to My Plants. The popup supports keyboard and pointer dismissal.
- See [dashboard page](./src/app/dashboard/page.js) and [dashboard styles](./src/app/dashboard/dashboard.module.css).

## Crop Assessment

- Centered the numbered badges in the “How it works” section without changing other assessment content.
- See [assessment styles](./src/app/assessment/assessment.module.css).

## Registration

- The location selector loads options from the locations API instead of relying on hardcoded IDs.
- Location-loading failures are displayed in the registration form.
- See [registration page](./src/app/register/page.js) and [registration styles](./src/app/register/register.module.css).
