<div align="center" style="margin: 1.5rem auto;">
  <table role="presentation" style="border:none;border-radius:18px;background:#0f172a;padding:1.5rem 2rem;box-shadow:0 10px 30px rgba(15,23,42,0.35);color:#f8fafc;width:100%;max-width:1200px;">
    <tr>
      <td style="vertical-align:middle;padding-right:1.5rem;">
        <img src="../web/public/icons/favicon_yellow.svg" alt="CommNG Favicon" width="72">
      </td>
      <td style="vertical-align:middle;">
        <h1 style="margin:0;font-size:2rem;color:#f8fafc;">🔒 ACM Certificate Setup Guide</h1>
      </td>
    </tr>
  </table>
</div>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#prerequisites">Prereqs</a> •
  <a href="#step-1-configure-your-domain">Domain Config</a> •
  <a href="#step-2-apply-terraform-configuration">Apply Terraform</a> •
  <a href="#step-3-get-dns-validation-cname-record">DNS Record</a> •
  <a href="#step-4-give-cname-to-devops">Share CNAME</a> •
  <a href="#step-5-wait-for-validation">Validation</a> •
  <a href="#what-was-created">Resources</a> •
  <a href="#verify-certificate-status">Verify</a> •
  <a href="#access-your-application">Access</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#removing-the-certificate">Removal</a>
</p>

# ACM Certificate Setup Guide

<a id="overview"></a>

## Overview
This guide explains how to set up SSL/TLS for your subdomain using AWS Certificate Manager (ACM).

<a id="prerequisites"></a>

## Prerequisites
- A domain or subdomain (e.g., `dev.yourdomain.com` or `api.yourdomain.com`)
- Access to your DNS provider to add CNAME records

<a id="step-1-configure-your-domain"></a>

## Step 1: Configure Your Domain

Edit `terraform.tfvars` and add your domain name:

```hcl
domain_name = "dev.yourdomain.com"  # Replace with your actual subdomain
```

<a id="step-2-apply-terraform-configuration"></a>

## Step 2: Apply Terraform Configuration

Run Terraform to create the ACM certificate:

```bash
terraform plan
terraform apply
```

<a id="step-3-get-dns-validation-cname-record"></a>

## Step 3: Get DNS Validation CNAME Record

After applying, Terraform will output the CNAME record needed for DNS validation:

```bash
terraform output acm_certificate_validation_records
```

The output will look like this:

```json
{
  "dev.yourdomain.com" = {
    "name"  = "_abc123.dev.yourdomain.com."
    "type"  = "CNAME"
    "value" = "_xyz456.acm-validations.aws."
  }
}
```

<a id="step-4-give-cname-to-devops"></a>

## Step 4: Give CNAME to DevOps

**Copy the following information to your DevOps team:**

```
CNAME Record for DNS Validation:

Name:  _abc123.dev.yourdomain.com.
Type:  CNAME
Value: _xyz456.acm-validations.aws.

Instructions: Add this CNAME record to the DNS zone for yourdomain.com
```

⚠️ **Important**: Your DevOps team needs to add this CNAME record to your DNS provider (e.g., Route 53, Cloudflare, Namecheap, etc.)

<a id="step-5-wait-for-validation"></a>

## Step 5: Wait for Validation

After the CNAME record is added to DNS:
- ACM will automatically validate the certificate (usually takes 5-30 minutes)
- The certificate status will change from "Pending Validation" to "Issued"
- The HTTPS listener on your ALB will start working

<a id="what-was-created"></a>

## What Was Created

1. **ACM Certificate** (`aws_acm_certificate.main`)
   - Domain: Your specified subdomain
   - Validation: DNS (CNAME record)
   - Auto-renews before expiration

2. **HTTPS Listener** (`aws_lb_listener.https`)
   - Port: 443
   - Protocol: HTTPS
   - TLS Policy: ELBSecurityPolicy-TLS13-1-2-2021-06
   - Certificate: Your ACM certificate

3. **HTTP → HTTPS Redirect**
   - All HTTP (port 80) traffic automatically redirects to HTTPS (port 443)
   - 301 permanent redirect

<a id="verify-certificate-status"></a>

## Verify Certificate Status

Check the certificate status in AWS Console:
1. Go to AWS Certificate Manager
2. Find your certificate for the domain
3. Status should show "Issued" after DNS validation completes

Or use AWS CLI:
```bash
aws acm describe-certificate --certificate-arn $(terraform output -raw acm_certificate_arn)
```

<a id="access-your-application"></a>

## Access Your Application

Once the certificate is validated:
- **HTTPS**: `https://dev.yourdomain.com`
- **HTTP**: `http://dev.yourdomain.com` (automatically redirects to HTTPS)

<a id="troubleshooting"></a>

## Troubleshooting

### Certificate Stuck in "Pending Validation"
- Verify the CNAME record was added correctly to DNS
- Check DNS propagation: `dig _abc123.dev.yourdomain.com CNAME`
- Wait up to 30 minutes for validation

### "No domain_name set" Error
- Make sure you added `domain_name = "your.domain.com"` to `terraform.tfvars`
- Run `terraform apply` again

### Certificate Not Working
- Ensure the certificate status is "Issued" in ACM
- Check ALB listener is using port 443
- Verify security group allows inbound traffic on port 443

<a id="removing-the-certificate"></a>

## Removing the Certificate

To remove the certificate and HTTPS listener:
1. Remove or set `domain_name = ""` in `terraform.tfvars`
2. Run `terraform apply`

This will:
- Delete the HTTPS listener
- Delete the ACM certificate
- Restore HTTP-only operation on port 80
