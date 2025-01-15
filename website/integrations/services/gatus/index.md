---
title: Integrate with Gatus
sidebar_label: Gatus
---

# Integrate with Gatus

<span class="badge badge--secondary">Support level: Community</span>

## What is Gatus?

> Gatus is a developer-oriented health dashboard that gives you the ability to monitor your services using HTTP, ICMP, TCP, and even DNS queries as well as evaluate the result of said queries by using a list of conditions on values like the status code, the response time, the certificate expiration, the body and many others. The icing on top is that each of these health checks can be paired with alerting via Slack, Teams, PagerDuty, Discord, Twilio and many more.
>
> -- https://github.com/TwiN/gatus

## Preparation

The following placeholders are used in this guide:

- `gatus.company` is the FQDN of the Gatus installation.
- `authentik.company` is the FQDN of the authentik installation.

:::note
This documentation only lists the settings that have been changed from their default values. Please verify your changes carefully to avoid any issues accessing your application.
:::

## authentik configuration

1. From the **authentik Admin interface**, navigate to **Applications** -> **Applications**.
2. Use the [wizard](https://docs.goauthentik.io/docs/add-secure-apps/applications/manage_apps#add-new-applications) to create a new application and a **OAuth2/OpenID Connect provider**. During this process:
    - Note the **Client ID**, **Client Secret**, and **slug** values because they will be required later.
    - Set a `Strict` redirect URI to <kbd>https://<em>gatus.company</em>/authorization-code/callback/</kbd>.

## Gatus configuration

To enable OIDC in Gatus, add the following configuration to the `config.yaml` file. This file is usually located at `/config/config.yaml` or in the path specified by the `GATUS_CONFIG_PATH` environment variable:

```yml
security:
    oidc:
        issuer-url: https://<em>authentik.company</em>/application/o/<em>your-slug</em>/
        client-id: "<em>Your Client ID</em>"
        client-secret: "<em>Your Client Secret</em>"
        redirect-url: https://<em>gatus.company</em>/authorization-code/callback
        scopes: [openid]
```

:::note
Gatus automatically updates its configuration approximately every 30 seconds. If the changes are not reflected, restart the instance to ensure the changes are applied.
:::
