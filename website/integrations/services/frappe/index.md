---
title: Integrate with Frappe
sidebar_label: Frappe
---

# Integrate with Frappe

<span class="badge badge--secondary">Support level: Community</span>

:::note
These instructions apply to all projects in the Frappe Family.
:::

## What is Frappe

> Frappe is a full stack, batteries-included, web framework written in Python and Javascript.
>
> -- https://frappe.io/

## Preparation

The following placeholders are used in this guide:

- `frappe.company` is the FQDN of the Frappe installation.
- `authentik.company` is the FQDN of the authentik installation.
- `provider` is the name for the social login provider in Frappe.

:::note
This documentation only lists the settings that have been changed from their default values. Please verify your changes carefully to avoid any issues accessing your application.
:::

## authentik configuration

1. From the **authentik Admin interface**, navigate to **Applications** -> **Applications**.
2. Use the [wizard](https://docs.goauthentik.io/docs/add-secure-apps/applications/manage_apps#add-new-applications) to create a new application and a **OAuth2/OpenID Connect provider**. During this process:
    - Note the **Client ID**, **Client Secret**, and **slug** values because they will be required later.
    - Set a `Strict` redirect URI to <kbd>https://<em>frappe.company</em>/api/method/frappe.integrations.oauth2_logins.custom/provider</kbd>.
    - Select any available signing key.
    - Under **Advanced Protocol Settings**, set **Subject mode** to be `Based on the Users's username`.

## Frappe configuration

1. **Navigate to Integrations**

    - From the Frappe main menu, go to **Integrations** and then select **Social Login Key**.

2. **Add a New Social Login Key**

    - Click the black **+ New** button in the top-right corner.  
      ![](./frappe1.png)

3. **Enter the Required Settings**

    - **Client Credentials**

        - **Enable Social Login**: Turn the toggle to the **on** position.
        - **Client ID**: Enter the Client ID from the authentik wizard.
        - **Client Secret**: Enter the Client Secret from the authentik wizard.

    - **Configuration**

        - **Sign-ups**: Set to **Allow**.  
          ![](./frappe2.png)

    - **Identity Details**

        - **Base URL**: <kbd>https://<em>authentik.company</em>/</kbd>
        - **Client URLs**:
            - **Authorize URL**: `/application/o/authorize/`
            - **Access Token URL**: `/application/o/token/`
            - **Redirect URL**: <kbd>https://<em>frappe.company</em>/api/method/frappe.integrations.oauth2_logins.custom/provider</kbd>
            - **API Endpoint**: `/application/o/userinfo/`  
              ![](./frappe3.png)

    - **Client Information**
        - **Auth URL Data**:
            ```json
            { "response_type": "code", "scope": "email profile openid" }
            ```
            ![](./frappe4.png)

4. **Save the Configuration**
    - Click the black **Save** button in the top-right corner to complete the setup.

## Verification

First, open an incognito browser window and go to `https://frappe.company`. On the login screen, click **Login with Provider**. You will be redirected to authentik to enter your credentials and to authorize the application. Once that's done, you will be redirected to the home screen of the Frappe application, confirming the successful login.
