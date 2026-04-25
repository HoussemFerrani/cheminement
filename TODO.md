# LAYOUTS & DESIGN

- [x] Standardization of the "Profile Selector"
  - [x] No matter where the client clicks on "Book an appointment", they will be presented with the same three options, in the same order as on the homepage:
    - For me (Individual)
    - For a loved one (Child, spouse, etc.)
    - For a patient (Professionals/Doctors)
  - [x] To avoid simply redirecting to the homepage, place an identical selection module on the Contact page and at the top of the Service page.
  - [x] Visually: three clear icons or buttons that open the corresponding form.
  - [ ] Direct Link: (optional) configure the buttons to point to a dedicated "Appointment Booking" page that displays these three choices in a streamlined manner. 
  - [x] Provide the photos (Ilyes suggests he will choose the images for the homepage/for school services).

## FORMS & MATCHING (HIGH PRIORITY)

- Priority: **P0** — Integrate search-based "reason for consultation" across homepage forms (this is the top priority).

- [x] Motif / Reason search engine (core)
  - [x] Replace classic dropdowns with an intelligent search component that suggests items from `MOTIFS` (alphabetical suggestions).
  - [x] Allow multi-selection (2–3 reasons) and expose selections to the matching algorithm.
  - Acceptance criteria: suggestions show while typing, results are alphabetically ordered, user can pick 1–3 reasons, selections are saved as an array and used by the routing/matching logic.
  - Files to update: `src/components/ui/MotifSearch.tsx` (add multi-select mode / maxSelection), `src/hooks/useMotifSearch.ts` (already supports alphabetical sort), `src/data/motif.ts` (source list).
  - Tests: unit tests for component behavior, integration test for forms.

- [x] Homepage forms — replace & standardize (Client, Professional, Loved one)
  - A. CLIENT (Individual / Adult)
    - Fields: Last name, First name, Date of birth, Gender (M/F/Other), Language (FR/EN/ES/AR/Other), City or Postal Code, Modality (In-person / Remote / Both), Availability (next week selector), Need (Reason search engine + free-text message), Type (individual/couple/family), Message.
    - Files: `src/app/appointment/page.tsx`, `src/components/appointments/AppointmentForm.tsx`, homepage CTA components where applicable.
  - B. PROFESSIONAL (Physician / Intermediary referral)
    - Fields: Referrer name (last/first; phone/email optional), Patient (last/first/DOB/phone or email), File upload (PDF) — prominent, Recommended approaches (short select list: CBT, ACT, Psychodynamic, Humanistic, Systemic, Hypnosis, Mindfulness), Reason (reason search engine).
    - Files: `src/app/appointment/page.tsx`, API endpoint for file upload if needed.
  - C. LOVED ONE (Parent / spouse / other)
    - Fields: Requester (last/first/relationship), Client (last/first/DOB/City or Postal Code/Language), Type of service (Individual/Family/Couple/Assessment — if Assessment selected, reason search suggests assessment subtypes), Message free text.
    - Files: same booking pages/components.
  - Acceptance criteria: all three forms use the same search UI for reasons, suggestions come from `MOTIFS`, selection persisted as array (max 3), forms validate client-side and server-side.

- [x] Workflow change: remove payment from initial homepage forms
  - [x] Remove/hide payment method fields from the first-step forms on the homepage/booking flow.
  - Flow: user completes simplified form → professional chooses a request and contacts client to schedule → only after scheduling the system prompts the client to complete payment method (credit card/transfer/direct debit) and validate banking profile to confirm appointment.
  - Files: `src/app/appointment/page.tsx` (hide payment step), `src/components/payments/PaymentModal.tsx`, `src/lib/notifications.ts` (ensure payment invitation email triggers at correct step).

- [x] Account structure for minors
  - [x] Implement "Account Manager / Guardian" for minors: parent is account manager and manages billing, but has access to child's file.
  - DB changes: add `guardianId` / `accountManager` fields to `User`/`Profile` schemas.
  - UI changes: booking forms and dashboard must show/allow parent management for minors.
  - Files: `src/models/User.ts`, `src/models/Profile.ts`, relevant dashboard pages.

- [ ] Matching algorithm & backend
  - [ ] Ensure `src/lib/appointment-routing.ts` consumes the selected reasons array and weights multi-reason matches appropriately.
  - [ ] Add tests that verify matching relevance when 1 vs 2 vs 3 reasons are selected.

- [ ] UX / i18n / validation
  - [x] Add translations for new labels (Languages list, form labels) in `messages/en.json` and `messages/fr.json` (and others if present).
  - [ ] Add form validation rules and helpful inline messages.
  - [ ] Create mockups / storybook stories for the three forms (requesting your validation).

- [ ] QA & tests
  - [ ] Unit tests for `MotifSearch` multi-select behavior.
  - [ ] Integration tests for the three forms and booking flow (ensure payment removed from initial form and payment-email triggers after confirmation).

## Next step
- Implement `MotifSearch` multi-select (P0) and swap it into the three homepage forms; create mockups for your validation.


## 1. "HOME" PAGE

- [x] Arrange the boxes in the following order:
  1. For me (Individual)
  2. For a loved one (Child, spouse, etc.)
  3. For a patient (Professionals/Doctors)

- [x] Block B — Three boxes (place them lower down in the advantages section)
  - [x] Quick Access — "Connect quickly with a mental health professional. No long waiting lists—start your journey to wellness sooner."
  - [x] Diversity of Professionals — "An intelligent matching system to guide you towards the professional who best suits your needs."
  - [x] Educational Resources — "Explore our library of videos and readings on anxiety, burnout, stress management, and more—available even before your first session."

## 2. Photo / Personalized Path

- [x] Move the photo of the young girl (initially under "Personalized Path") back up to its original place.
- [x] Resizing: reduce its dimensions so it integrates more fluidly and is less imposing within the section.
- [x] Advantages Section: add a new photo (pending your/thematic image).
- [] Remove the following boxes: "Confidentiality assured" (personalized approach/flexible planning and confidential support).

## 3. SERVICE PAGE

- [x] A. Mental Health at Work — section dedicated to companies (unchanged in substance).
  - [x] CTA / Company Manager: short form (last name, first name, email, phone, company, position, contact details).

- [x] D. Specific Action Buttons: CTA
  - [x] "Parent / For my young person" — Direct to form (use the same form as "book an appointment for a loved one" on the homepage).

- [x] Update copy for "Adult Psychotherapy" (service/adult-psychotherapy):
  - [x] Replace:
    > Comprehensive mental health support for adults facing life's challenges. From anxiety and depression to relationship issues and life transitions, our qualified professionals offer personalized therapeutic care.
  - [x] With:
    > Mental health support for adults facing life's challenges. From anxiety and depression, relationship issues and life transitions, our professionals offer personalized therapeutic care.

## 4. "APPROACH" PAGE

- [x] Add an "Integrative Approach" box:
  - [x] "A combination of different psychological techniques and theories adapted to each person's unique needs, rather than being limited to a single approach."
- [x] Add "Book an appointment" buttons in Blocks A or B of the approaches section (in addition to the existing button at the bottom of the page).

## 6. "CONTACT" PAGE (Details and Finishes)

- [x] Layout: do not change the spacing; this is the reference model.

## 7. "I am a professional" Page

- [x] Add a period (.) at the end of the sentences: type of problem/therapeutic approach/category/expertise and skill.
- [x] Replace:
  - "Join 1000+ professionals"
  - With: "Join several active professionals"

## 8. The Bottom Bar

- [x] Add links/items to the bottom bar:
  - Partners
  - Book an appointment
  - Services
  - Why us
  - Explore resources
  - Platform
  - Press
  - I am on a journey (for phone) - PLEASE USE THIS WORDING INSTEAD but I don't know if we will have a version for phone.
  - Contact us
- [x] Add further down:
  - Privacy Policy
  - Terms of Use
  - Cookie Policy
  - Social media icons
