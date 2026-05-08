# Customer.io Campaign Atlas - Flow Breakdown

This document outlines the three primary customer paths currently mapped in the UENI Marketing Atlas. It provides an overview of how campaigns are structured for Leads, Launch users, and Plus users.

## 1. Leads Path (Top of Funnel to Pre-Purchase)
This path captures all email interactions from initial acquisition up until a user completes their payment.

**Acquisition Sources & Leads**
* **Mylo Partner Leads (MY):** Nurture sequence for leads referred by business insurance partner.
* **Swyft Partner Leads (SW):** Nurture sequence for incorporation partner leads.
* **US Gov Business Database (WG):** Cold outreach to newly incorporated US businesses.
* **Other Sources:** Facebook (FB), Google (GG), Website Audit (SBA), Wix Leads (WX), Exit Intent (EI).

**Nurture Sequences**
* **Pre-Signup Nurture (PS608):** Target customers who submitted an email on a landing page but haven't created an account yet.
* **Example Pages Send (EX572):** Sending relevant live examples to inspire the user.
* **Signed Up No Payment (SIG):** Checkpoint before post-signup flows.
* **Post-Signup Nurture (PSL607):** Core pre-purchase conversion flow for users who have an account but haven't bought a plan.
* **US Leads Monthly Re-acquisition (REC/1044) & Acquisition Drop-Off (ADO926):** Engagement drops and re-acquisition attempts for stale leads.

---

## 2. Launch Users Path (Post-Purchase & Retention)
This path covers customers who purchase the standard 'Launch' plan, from confirmation through website delivery and feature activation.

**Onboarding & Fulfillment (Shared with Plus)**
* **Launch Purchase Confirmation (PCL580):** Confirms payment and sets expectations. First touchpoint after purchase.
* **SmartForm Chasers (TFC401):** Primary sequence pushing them to complete the intake questionnaire.
* **DLC Chasers (DLC402):** Prompts users to book their Design & Launch Call.
* **SmartForm Re-engagement (SFC879):** Re-engages customers who ignored the primary chaser flow.
* **Post-SmartForm & DLC Booked (TFD403):** Handoff confirming next steps while the site is being built.
* **Your Website is Live (WBL287):** Notifies the user the site is published and guides them to the dashboard.

**Launch Activation & Retention**
* **Launch Retention Main Flow (LRF854):** Core retention sequence. Drives feature activation to reduce churn.
* **Feature Activation Triggers:**
  * **Domain (LDO970):** Missing custom domain connection.
  * **Email (LEI971):** Missing professional email setup.
  * **Stripe (LST972):** Missing Stripe payment gateway.
  * **PayPal (LPP973):** Missing PayPal gateway.

**Upgrades & Churn**
* **Launch → Upgrade Nudge (LUF916):** Sequence nudging Launch customers to upgrade to Plus or Growth.
* **Win-Back & Cancelled (WBF964 / CXD1039):** Attempts to bring back customers who have churned.

---

## 3. Plus & Growth Users Path (Post-Purchase & Retention)
This path is customized for premium tier users, triggering expanded onboarding and additional feature activations specific to their plan.

**Onboarding & Fulfillment**
* **Plus Purchase Confirmation (PCP888):** Higher-tier onboarding kickoff.
* *(Shares the same SmartForm and Website Delivery pipeline as Launch users).*

**Plus Activation & Retention**
* **Plus Retention Main Flow (PRF974):** Core sequence driving full platform activation across advanced features.
* **Plus Feature Activation Triggers:**
  * **Domain (PDO977) & Email (PEM978)**
  * **Stripe (PST979) & PayPal (PPP980)**
  * **GMB Connection (PGC981):** Pushing users to connect Google Business Profile.
  * **GMB Verification (PGV982):** Following up on GBP verification status.
* **Growth Onboarding Pilot (GPILOT994):** Custom flow for top-tier Growth customers.
* **90-Day NPS Survey (NPSF911):** Satisfaction survey to flag at-risk accounts.

**Upsell & Upgrades**
* **Plus → Growth AM Emails (PLG1008):** Targeted Account Management emails to upgrade to Growth.
* **Plus Upgrade Full Flow (UPGRADE918):** Full nurture sequence for long-term Plus customers. 
* **Monthly → Annual Switch (MTA250):** Pushing monthly Plus subscribers to commit to annual billing.
