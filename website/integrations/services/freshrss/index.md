---
title: Integrate with FreshRSS
sidebar_label: FreshRSS
---

# Integrate with FreshRSS

<span class="badge badge--secondary">Support level: Community</span>

## What is FreshRSS

> FreshRSS is a self-hosted RSS feed aggregator.
>
> -- https://github.com/FreshRSS/FreshRSS

## Preparation

The following placeholders are used in this guide:

- `freshrss.company` is the FQDN of the FreshRSS installation.
- `authentik.company` is the FQDN of the authentik installation.

:::note
This documentation only lists the settings that have been changed from their default values. Please verify your changes carefully to avoid any issues accessing your application.
:::

## authentik configuration

1. From the **authentik Admin interface**, navigate to **Applications** -> **Applications**.
2. Use the [wizard](https://docs.goauthentik.io/docs/add-secure-apps/applications/manage_apps#add-new-applications) to create a new application and a **OAuth2/OpenID Connect provider**. During this process:
    - Note the **Client ID**, **Client Secret**, and **slug** values because they will be required later.
    - Add two `Strict` redirect URI and set them to <kbd>https://<em>freshrss.company</em>/i/oidc/</kbd> and <kbd>https://<em>freshrss.company:443</em>/i/oidc/</kbd>. If FreshRSS is exposed on a port other than `443`, update the second redirect URI accordingly.
    - Select any available signing key.

## FreshRSS configuration

:::info
This integration is compatible only with Docker or Kubernetes installations of FreshRSS that use the [FreshRSS Docker image](https://hub.docker.com/r/freshrss/freshrss/) on x86_64 systems. Note that the Alpine version of the image is not supported. For more details, see [this issue on the FreshRSS GitHub repository](https://github.com/FreshRSS/FreshRSS/issues/5722).
:::

To enable OIDC login with FreshRSS, update your `.env` file with the following variables:

```
OIDC_ENABLED=1
OIDC_PROVIDER_METADATA_URL=https://<em>authentik.company</em>/application/o/<em>application-slug</em>/.well-known/openid-configuration
OIDC_CLIENT_ID=<em>Your Client ID</em>
OIDC_CLIENT_SECRET=<em>Your Client Secret</em>
OIDC_X_FORWARDED_HEADERS=X-Forwarded-Port X-Forwarded-Proto X-Forwarded-Host
OIDC_SCOPES=openid email profile
```

:::warning
Before restarting your Docker container, ensure that at least one Admin user in your FreshRSS instance has a username that matches an authentik user.
:::

Restart your FreshRSS container, then log in as a user that exists in both FreshRSS and authentik.

Go to **Settings** -> **Authentication** in your FreshRSS instance and set the authentication method to **HTTP**.

Additional configuration options can be found in the [FreshRSS documentation for OpenID Connect](https://freshrss.github.io/FreshRSS/en/admins/16_OpenID-Connect.html).
