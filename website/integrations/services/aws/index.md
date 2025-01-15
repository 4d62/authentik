---
title: Integrate with Amazon Web Services
sidebar_label: Amazon Web Services
---

# Integrate with Amazon Web Services

<span class="badge badge--primary">Support level: authentik</span>

## What is AWS

> Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud, with more than 200 fully featured services available from data centers globally. Millions of customers—including the fastest-growing startups, largest enterprises, and leading government agencies—are using AWS to lower costs, increase security, become more agile, and innovate faster.
>
> -- https://www.aboutamazon.com/what-we-do/amazon-web-services

## Choose Your Integration Method

There are two primary methods to integrate authentik with AWS:

1. **Classic IAM (SAML)** – The traditional method of integrating using SAML-based authentication.
2. **IAM Identity Center (AWS SSO)** – A newer, simplified method for managing user access.

## Method 1: Classic IAM (SAML Integration)

### authentik Configuration

1. **Create an Application**: Create an application in authentik and note the **slug**, which will be used later.
2. **Create a SAML Provider**: Set up a SAML provider with these configurations:

    - **ACS URL**: `https://signin.aws.amazon.com/saml`
    - **Issuer**: `authentik`
    - **Binding**: `Post`
    - **Audience**: `urn:amazon:webservices`
      You can choose a custom signing certificate and adjust duration settings as necessary. !!!!!TODO WIZARD

3. **Configure Property Mappings**: Customize property mappings as needed for your AWS integration.

#### Role Mapping

!!!!!TODO: WHERE/HOW

The **Role Mapping** specifies the AWS ARN(s) of the identity provider and the role the user should assume. Set the **SAML Name** field to `https://aws.amazon.com/SAML/Attributes/Role`. Below are several examples for role mapping:

- **Static ARN Mapping**:

    ```python
    return "arn:aws:iam::123412341234:role/saml_role,arn:aws:iam::123412341234:saml-provider/authentik"
    ```

- **Role Mapping Based on Group Membership**:

    ```python
    role_name = user.group_attributes().get("aws_role", "")
    return f"arn:aws:iam::123412341234:role/{role_name},arn:aws:iam::123412341234:saml-provider/authentik"
    ```

- **Multiple Role Mapping**:

    ```python
    return [
        "arn:aws:iam::123412341234:role/role_a,arn:aws:iam::123412341234:saml-provider/authentik",
        "arn:aws:iam::123412341234:role/role_b,arn:aws:iam::123412341234:saml-provider/authentik",
        "arn:aws:iam::123412341234:role/role_c,arn:aws:iam::123412341234:saml-provider/authentik",
    ]
    ```

#### Role Session Name Mapping

The **RoleSessionName Mapping** defines the name shown in the AWS Management Console. Set the **SAML Name** field to `https://aws.amazon.com/SAML/Attributes/RoleSessionName`. To use the user's username, use this expression:

```python
return user.username
```

### AWS Configuration

1. **Create a Role**: In AWS, create a role with the desired permissions, and note its **ARN**. !!!!!TODO: HOW
2. **Identity Provider**: Export the metadata from authentik and create a new Identity Provider in AWS by visiting [IAM Providers](https://console.aws.amazon.com/iam/home#/providers).
3. **Property Mappings**: After creating the role, ensure that the property mappings from authentik are applied correctly in AWS.

For further instructions, refer to the [AWS IAM Documentation on SAML](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_saml_assertions.html).

## Method 2: IAM Identity Center (AWS SSO)

### authentik Configuration

1. **Create a SAML Provider**: In authentik, navigate to **Providers**, click **Create**, and select **SAML Provider from metadata**. Upload the metadata file provided by AWS.
2. **Configure the Provider**: Set the **Audience** field to the **Issuer URL** from AWS. Under **Advanced Protocol Settings**, configure the **Signing Certificate**.
3. **Download Metadata and Certificate**: After setting up, download the **Metadata file** and **Signing Certificate**. !!!!!TODO WIZARD

For more detailed steps, refer to [AWS IAM Identity Center Federation Setup](https://docs.aws.amazon.com/singlesignon/latest/userguide/federation.html).

### AWS Configuration

1. **Change Identity Source**: In AWS, !!!!!TODO FROM THE MAIN DASH go to **IAM Identity Center -> Settings -> Identity Source (tab)**. Click **Actions** -> **Change identity source** and choose **External Identity Provider**.
2. **Upload Metadata and Certificate**: Upload both the **Metadata file** and **Signing Certificate** from authentik into AWS.
3. **Authentication Settings**: In AWS, under **IAM Identity Center -> Settings**, click **Manage Authentication**. Note the AWS access portal sign-in URL.

For more on configuring AWS, refer to [AWS IAM Identity Center Documentation](https://docs.aws.amazon.com/singlesignon/latest/userguide/identity-source.html).

## Optional: SCIM for Automated Provisioning

SCIM (System for Cross-domain Identity Management) allows you to automate the synchronization of users, groups, and attributes between authentik and AWS.

### authentik Configuration

Navigate to **Providers** -> **Create**
- Select **SCIM Provider**
- Give it a name, under **URL** enter the **SCIM Endpoint**, and then under **Token** enter the **Access Token** AWS provided you with.
- Optionally, change the user filtering settings to your liking. Click **Finish**

- Go to **Customization -> Property Mappings**
- Click **Create -> SCIM Mapping**
- Make sure to give the mapping a name that's lexically lower THE WHAT? than `authentik default`, for example `AWS SCIM User mapping`
- As the expression, enter:

```python
# This expression strips the default mapping from its 'photos' attribute,
# which is a forbidden property in AWS IAM.
return {
    "photos": None,
}
```
1. **Enable SCIM**: In AWS, navigate to **Settings** and enable **Automatic Provisioning**. AWS will provide the **SCIM Endpoint** and **Access Token**.
2. **Sync Users**: Once configured, the SCIM provider will automatically sync users and groups between authentik and AWS IAM. You can trigger manual sync by going to the SCIM provider and clicking **Run sync again**.

- Click **Save**. Navigate back to your SCIM provider, click **Edit**
- Under **User Property Mappings** select the default mapping and the mapping that you just created.
- Click **Update**
For more on SCIM, refer to the [AWS SCIM Documentation](https://docs.aws.amazon.com/singlesignon/latest/userguide/scim.html).

### AWS Configuration

1. **Enable SCIM**: In AWS, navigate to **Settings** and enable **Automatic Provisioning**. AWS will provide the **SCIM Endpoint** and **Access Token**.
2. **Sync Users**: Once configured, the SCIM provider will automatically sync users and groups between authentik and AWS IAM. You can trigger manual sync by going to the SCIM provider and clicking **Run sync again**.

For more on SCIM, refer to the [AWS SCIM Documentation](https://docs.aws.amazon.com/singlesignon/latest/userguide/scim.html).

:::info
Ensure users already exist in AWS for successful authentication via authentik. AWS will throw an error if the user is not found. !!!!!TODO THIS IS TECHNICALLY A DIFFERENT THING For troubleshooting, check Amazon CloudTrail logs for `ExternalIdPDirectoryLogin`.
:::

!!!!!TODO VERIFICIATION STEP

ADD The SCIM provider syncs automatically whenever you create/update/remove users, groups, or group membership. You can manually sync by going to your SCIM provider and clicking **Run sync again**. After the SCIM provider has synced, you should see the users and groups in your AWS IAM center.
