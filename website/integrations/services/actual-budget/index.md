---
title: Integrate with Actual Budget
sidebar_label: Actual Budget
---

# Actual Budget

<span class="badge badge--secondary">Support level: Community</span>

## What is Actual Budget

> Actual Budget is a web-based financial management software. It helps users track and manage their income, expenses, and budgets in real time. The software compares actual spending with planned budgets to improve financial decisions.
>
> -- https://actualbudget.org/

## Preparation

The following placeholders are used in this guide:

- `actual.company` is the FQDN of the Actual Budget installation.
- `authentik.company` is the FQDN of the authentik installation.

:::note
This documentation only lists the settings that have been changed from their default values. Please verify your changes carefully to avoid any issues accessing your application.
:::

## authentik configuration

1. From the **authentik Admin interface**, navigate to **Applications** -> **Applications**.
2. Use the [wizard](https://docs.goauthentik.io/docs/add-secure-apps/applications/manage_apps#add-new-applications) to create a new application and a **OAuth2/OpenID Connect provider**. During this process:
    - Note the **Client ID**, **Client Secret**, and **slug** values because they will be required later.
    - Set a `Strict` redirect URI to <kbd>https://<em>actual.company</em>/openid/callback/</kbd>.
    - Select any available signing key.

:::info
Actual Budget only supports the RS256 algorithm. Be aware of this when choosing the appropriate signing key.
:::

## Actual Budget configuration

1. Sign in to Actual Budget and select your budget by clicing its name.
2. In the top-left corner, click your budget name to open the dropdown and choose **Settings**.
3. Scroll down and select **Show advanced settings**, then enable **I understand the risks, show experimental features**.
4. Enable **OpenID authentication method**.
5. Scroll up and click **Start using OpenID** under the **Authentication method** section.
6. Fill in the following values:
    - **OpenID Provider**: authentik
    - **OpenID provider URL**: <kbd>https://<em>authentik.company</em>/application/o/<em>your-application-slug</em>/</kbd>
    - **Client ID**: Enter the **Client ID** from authentik
    - **Client Secret**: Enter the **Client Secret** from authentik

:::warning
The first user to log into Actual Budget via OpenID will become the owner and administrator with the highest privileges for the budget. For more information on how to create additional users, see the Note below.
:::

:::info
Users are not created automatically in Actual Budget. The owner must manually add users. To do this, go to **Server online** > **User Directory**, and create users matching their authentik usernames. Then, grant access to the budget via **User Access**.
:::

## Test the login

1. Open a browser and navigate to <kbd>https://<em>actual.company</em>/</kbd>.
2. Select the OpenID login method in the dropdown menu and click **Sign in with OpenID**.
3. You will be redirected to authentik to complete the login process, then back to Actual Budget.
4. If you reach the budget selection page, the integration is successful.
