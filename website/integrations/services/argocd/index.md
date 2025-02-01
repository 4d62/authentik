---
title: Integrate with ArgoCD
sidebar_label: ArgoCD
---

# Integrate with ArgoCD

<span class="badge badge--secondary">Support level: Community</span>

## What is ArgoCD

> Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes.
>
> -- https://argoproj.github.io/cd/

## Preparation

The following placeholders are used in this guide:

- `argocd.company` is the FQDN of the ArgoCD installation.
- `authentik.company` is the FQDN of the authentik installation.

:::note
This documentation lists only the settings that you need to change from their default values. Be aware that any changes other than those explicitly mentioned in this guide could cause issues accessing your application.
:::

## authentik Configuration

### Wizard configuration

1. From the **authentik Admin interface**, navigate to **Applications** -> **Applications**.
2. Use the wizard to create a new application and with an **OAuth2/OpenID** provider. During this process:
    - Note the **Client ID**, **Client Secret**, and **slug** values because they will be required later.
    - Add two `Strict` redirect URIs and set them to `https://argocd.company/api/dex/callback` and `http://localhost:8085/auth/callback`.
    - Select any available signing key.

### ArgoCD group creation

Using the **authentik Admin interface**, go to **Directory** -> **Groups** and click **Create**. ArgoCD lets you to set up administrator users and read-only users by creating groups named `ArgoCD Admins` and `ArgoCD Viewers`.

After creating the groups, select a group, navigate to the **Users** tab, and manage its members by using the **Add existing user** and **Create user** buttons as needed.

## Terraform provider

```hcl
data "authentik_flow" "default-provider-authorization-implicit-consent" {
  slug = "default-provider-authorization-implicit-consent"
}

data "authentik_flow" "default-provider-invalidation" {
  slug = "default-invalidation-flow"
}

data "authentik_property_mapping_provider_scope" "scope-email" {
  name = "authentik default OAuth Mapping: OpenID 'email'"
}

data "authentik_property_mapping_provider_scope" "scope-profile" {
  name = "authentik default OAuth Mapping: OpenID 'profile'"
}

data "authentik_property_mapping_provider_scope" "scope-openid" {
  name = "authentik default OAuth Mapping: OpenID 'openid'"
}

data "authentik_certificate_key_pair" "generated" {
  name = "authentik Self-signed Certificate"
}

resource "authentik_provider_oauth2" "argocd" {
  name          = "ArgoCD"
  #  Required. You can use the output of:
  #     $ openssl rand -hex 16
  client_id     = "my_client_id"

  # Optional: will be generated if not provided
  # client_secret = "my_client_secret"

  authorization_flow = data.authentik_flow.default-provider-authorization-implicit_consent.id
  invalidation_flow  = data.authentik_flow.default-provider-invalidation.id

  signing_key = data.authentik_certificate_key_pair.generated.id

  allowed_redirect_uris = [
    {
      matching_mode = "strict",
      url           = "https://argocd.company/api/dex/callback",
    },
    {
      matching_mode = "strict",
      url           = "http://localhost:8085/auth/callback",
    }
  ]

  property_mappings = [
    data.authentik_property_mapping_provider_scope.scope-email.id,
    data.authentik_property_mapping_provider_scope.scope-profile.id,
    data.authentik_property_mapping_provider_scope.scope-openid.id,
  ]
}

resource "authentik_application" "argocd" {
  name              = "ArgoCD"
  slug              = "argocd"
  protocol_provider = authentik_provider_oauth2.argocd.id
}

resource "authentik_group" "argocd_admins" {
  name    = "ArgoCD Admins"
}

resource "authentik_group" "argocd_viewers" {
  name    = "ArgoCD Viewers"
}
```

## ArgoCD Configuration

:::note
We're not going to use the oidc config, but instead the "dex", oidc doesn't allow ArgoCD CLI usage while DEX does.
:::

### Step 1 - Add the OIDC Secret to ArgoCD

In the `argocd-secret` Secret, add the following value to the `data` field:

```yaml
dex.authentik.clientSecret: <base 64 encoded value of the Client Secret from the Provider above>
```

If using Helm, the above can be added to `configs.secret.extra` in your ArgoCD Helm `values.yaml` file as shown below, securely substituting the string however you see fit:

```yaml
configs:
    secret:
        extra:
            dex.authentik.clientSecret: "${argocd_authentik_client_secret}"
```

### Step 2 - Configure ArgoCD to use authentik as OIDC backend

In the `argocd-cm` ConfigMap, add the following to the data field :

```yaml
url: https://argocd.company
dex.config: |
    connectors:
    - config:
        issuer: https://authentik.company/application/o/<application slug defined in step 2>/
        clientID: <client ID from the Provider above>
        clientSecret: $dex.authentik.clientSecret
        insecureEnableGroups: true
        scopes:
          - openid
          - profile
          - email
      name: authentik
      type: oidc
      id: authentik
```

### Step 3 - Map the `ArgoCD Admins` group to ArgoCD's admin role

In the `argocd-rbac-cm` ConfigMap, add the following to the data field (or create it if it's not already there) :

```yaml
policy.csv: |
    g, ArgoCD Admins, role:admin
    g, ArgoCD Viewers, role:readonly
```

If you already had an "admin" group and thus didn't create the `ArgoCD Admins` one, just replace `ArgoCD Admins` with your existing group name.
If you did not opt to create a read-only group, or chose to use one with a different name in authentik, rename or remove here accordingly.

Apply all the modified manifests, and you should be able to login to ArgoCD both through the UI and the CLI.
