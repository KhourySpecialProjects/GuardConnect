<div align="center" style="margin: 1.5rem auto;">
  <table role="presentation" style="border:none;border-radius:18px;background:#0f172a;padding:1.5rem 2rem;box-shadow:0 10px 30px rgba(15,23,42,0.35);color:#f8fafc;width:100%;max-width:1200px;">
    <tr>
      <td style="vertical-align:middle;padding-right:1.5rem;">
        <img src="../web/public/icons/favicon_yellow.svg" alt="CommNG Favicon" width="72">
      </td>
      <td style="vertical-align:middle;">
        <h1 style="margin:0;font-size:2rem;color:#f8fafc;">🔄 Database Secret Rotation</h1>
      </td>
    </tr>
  </table>
</div>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#system-flow">System Flow</a> •
  <a href="#rotation-timeline">Timeline</a> •
  <a href="#secret-rotation-event-sequence">Event Sequence</a> •
  <a href="#environment-configuration">Environment</a> •
  <a href="#iam-permissions-flow">IAM</a> •
  <a href="#environment-variables">Env Vars</a> •
  <a href="#infrastructure-setup">Infrastructure</a> •
  <a href="#testing-secret-rotation">Testing</a> •
  <a href="#architecture-comparison">Architecture</a> •
  <a href="#monitoring">Monitoring</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#local-development">Local Dev</a> •
  <a href="#future-enhancements">Future</a> •
  <a href="#related-files">Files</a>
</p>

# Database Secret Rotation

<a id="overview"></a>

## Overview

The application supports automatic database credential rotation using AWS Secrets Manager. When RDS rotates the master password, the application automatically detects the change and reconnects with new credentials without requiring a restart.

<a id="how-it-works"></a>

## How It Works

### 1. **Secrets Manager Integration**

The RDS instance uses AWS-managed master user password (`manage_master_user_password = true`), which automatically stores the password in AWS Secrets Manager and supports rotation.

### 2. **Auto-Refresh Mechanism**

The application periodically polls Secrets Manager to check for credential changes:

- **Default interval**: 5 minutes (300,000 ms)
- **Configurable**: Set `DB_SECRET_REFRESH_INTERVAL_MS` environment variable

### 3. **Graceful Reconnection**

When a password rotation is detected:

1. Application fetches new credentials from Secrets Manager
2. Creates a new connection pool with updated credentials
3. Tests the new connection
4. Swaps to the new pool
5. Allows existing queries 30 seconds to complete
6. Closes the old pool

This ensures zero downtime during secret rotation.

<a id="system-flow"></a>

## System Flow

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Environment                              │
│                                                                      │
│  ┌──────────────────┐          ┌──────────────────┐                │
│  │   RDS Database   │          │ Secrets Manager  │                │
│  │                  │          │                  │                │
│  │  Managed Master  │◄────────►│  DB Credentials  │                │
│  │    Password      │  rotate  │   (JSON)         │                │
│  └──────────────────┘          └──────────────────┘                │
│                                        ▲                             │
│                                        │                             │
│                                        │ poll every                  │
│                                        │ 5 minutes                   │
│                                        │                             │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │              ECS Fargate Tasks                          │        │
│  │                                                         │        │
│  │  ┌──────────────────────────────────────────────────┐   │        │
│  │  │  Application Container                           │   │        │
│  │  │                                                  │   │        │
│  │  │  ┌────────────────────────────────────────┐      │   │        │
│  │  │  │  Secrets Manager Client                │      │   │        │
│  │  │  │  (utils/secrets-manager.ts)            │      │   │        │
│  │  │  │                                        │      │   │        │
│  │  │  │  • Polls every 5 minutes               │      │   │        │
│  │  │  │  • Compares password hash              │      │   │        │
│  │  │  │  • Triggers callback on change         │      │   │        │
│  │  │  └────────────────────────────────────────┘      │   │        │
│  │  │              │                                   │   │        │
│  │  │              │ password changed?                 │   │        │
│  │  │              ▼                                   │   │        │
│  │  │  ┌────────────────────────────────────────┐      │   │        │
│  │  │  │  Database Connection Pool              │      │   │        │
│  │  │  │  (data/db/sql.ts)                      │      │   │        │
│  │  │  │                                        │      │   │        │
│  │  │  │  Old Pool ───┐                         │      │   │        │
│  │  │  │   (draining) │  30s grace period       │      │   │        │
│  │  │  │              │                         │      │   │        │
│  │  │  │  New Pool ◄──┘  (active)               │      │   │        │
│  │  │  └────────────────────────────────────────┘      │   │        │
│  │  └──────────────────────────────────────────────────┘   │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

</div>

<a id="rotation-timeline"></a>

## Rotation Timeline

<div align="center">

```
Time (minutes)    0    1    2    3    4    5    6    7    8
                  │    │    │    │    │    │    │    │    │
RDS Rotation      ●────────────────────────────────────────
                  │
Secrets Manager   │    New Password Available
                  │    ●───────────────────────────────────
                       │
App Poll          ●────●────●────●────●────●────●────●────
                                   │
Password Detected                  ● (at 5 min mark)
                                   │
New Pool Created                   ●─┐
                                     │
Old Pool Active                      ├──● (30s later)
                                     │
Old Pool Closed                      └──●

Legend:
  ● = Event occurs
  ─ = Time passes
```

</div>

<a id="secret-rotation-event-sequence"></a>

## Secret Rotation Event Sequence

<div align="center">

```
1. AWS RDS initiates password rotation
   └─► Secrets Manager updated with new credentials

2. Application polls Secrets Manager (every 5 minutes)
   └─► Fetches current secret value
   └─► Compares password with cached value

3. Password change detected
   └─► Log: "Database password rotation detected"
   └─► Trigger refreshDatabaseConnection callback

4. Create new connection pool
   └─► Parse credentials from Secrets Manager
   └─► Initialize new pg.Pool with updated password
   └─► Test connection with pool.connect()

5. Swap connection pools
   └─► Update exported 'pool' reference
   └─► Update exported 'db' (drizzle) reference
   └─► Mark old pool for decommission

6. Grace period (30 seconds)
   └─► Old pool continues serving active queries
   └─► New pool serves all new queries

7. Close old pool
   └─► pool.end() on old pool
   └─► Log: "Old database pool closed"
   └─► Log: "Database connection successfully refreshed"
```

</div>

<a id="environment-configuration"></a>

## Environment Configuration

### Production (ECS)

```bash
# Required for auto-rotation
AWS_REGION=us-east-1
DB_SECRET_ID=arn:aws:secretsmanager:...
DB_SECRET_REFRESH_INTERVAL_MS=300000

# Standard connection params (fallback)
POSTGRES_HOST=db.region.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=comm_ng
POSTGRES_SSL=true
POSTGRES_POOL_SIZE=20

# Credentials injected by ECS from Secrets Manager
# (used for initial connection, then refreshed via SDK)
POSTGRES_USER=comm_ng_user
POSTGRES_PASSWORD=<from-secrets-manager>
```

### Local Development

```bash
# No Secrets Manager integration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=comm_ng
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-local-password
POSTGRES_SSL=false
POSTGRES_POOL_SIZE=20
```

<a id="iam-permissions-flow"></a>

## IAM Permissions Flow

<div align="center">

```
ECS Task Role
  │
  ├─► secretsmanager:GetSecretValue
  │   └─► Allows runtime fetching of DB credentials
  │
  └─► secretsmanager:DescribeSecret
      └─► Allows checking rotation status

ECS Task Execution Role (separate)
  │
  └─► secretsmanager:GetSecretValue
      └─► Allows ECS to inject secrets as env vars at startup
```

</div>

<a id="environment-variables"></a>

## Environment Variables

### Required (for AWS environments)

```bash
AWS_REGION=us-east-1                    # AWS region for Secrets Manager
DB_SECRET_ID=<secret-arn>               # ARN of the database secret
```

### Optional

```bash
DB_SECRET_REFRESH_INTERVAL_MS=300000    # How often to check for rotation (default: 5 minutes)
```

### Fallback (for local development)

If `DB_SECRET_ID` is not set, the application falls back to standard environment variables:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=comm_ng
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_SSL=false
POSTGRES_POOL_SIZE=20
```

<a id="infrastructure-setup"></a>

## Infrastructure Setup

### Terraform Configuration

The infrastructure automatically configures:

1. **RDS with AWS-managed password**
   ```terraform
   manage_master_user_password = true
   ```

2. **ECS environment variables**
   ```terraform
   DB_SECRET_ID = aws_db_instance.dev_db_comm_ng.master_user_secret[0].secret_arn
   DB_SECRET_REFRESH_INTERVAL_MS = "300000"
   ```

3. **IAM permissions**
   - Task execution role: Read secrets during container startup
   - Task role: Read secrets during runtime for auto-refresh

### IAM Permissions

The ECS task role includes:

```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue",
    "secretsmanager:DescribeSecret"
  ],
  "Resource": ["<db-secret-arn>"]
}
```

<a id="testing-secret-rotation"></a>

## Testing Secret Rotation

### Manual Rotation via AWS CLI

```bash
# Rotate the database password
aws secretsmanager rotate-secret \
  --secret-id <secret-arn> \
  --rotation-lambda-arn <rotation-lambda-arn>
```

### Manual Rotation via AWS Console

1. Navigate to AWS Secrets Manager
2. Select your database secret
3. Click "Rotate secret immediately"
4. Wait for rotation to complete (usually < 1 minute)

### Verify Auto-Refresh

Check application logs for:

```
Successfully fetched database credentials from Secrets Manager
Database password rotation detected
Refreshing database connection with rotated credentials
Database connection successfully refreshed with new credentials
Old database pool closed
```

<a id="architecture-comparison"></a>

## Architecture Comparison

### Before (ECS Restart Approach)

1. Secret rotates
2. EventBridge triggers Lambda
3. Lambda forces ECS service restart
4. All containers restart (downtime)
5. New containers pick up new password

**Drawbacks**:
- Service downtime during restart
- All connections dropped
- Active requests fail

### After (Auto-Refresh Approach)

1. Secret rotates
2. Application polls Secrets Manager
3. Detects password change
4. Creates new connection pool
5. Gracefully transitions to new pool
6. Old pool drains over 30 seconds

**Benefits**:
- Zero downtime
- No dropped connections
- Graceful transition
- Can still use Lambda as backup

<a id="monitoring"></a>

## Monitoring

### CloudWatch Logs

Monitor the following log patterns:

- `"Auto-refresh started"` - Secret polling initialized
- `"Database password rotation detected"` - Rotation detected
- `"Database connection successfully refreshed"` - Successful transition
- `"Failed to refresh database connection"` - Error during refresh

### Metrics to Track

- Database connection pool size
- Active database queries during rotation
- Failed connection attempts
- Time to detect rotation

<a id="troubleshooting"></a>

## Troubleshooting

### Rotation Not Detected

1. Check `DB_SECRET_ID` environment variable is set correctly
2. Verify IAM permissions for task role
3. Check refresh interval - default is 5 minutes
4. Review CloudWatch logs for errors

### Failed Reconnection

1. Verify new credentials are valid
2. Check RDS security groups allow connections
3. Ensure SSL settings match (`POSTGRES_SSL`)
4. Review CloudWatch logs for specific errors

### Performance Impact

The polling mechanism is lightweight:
- Only fetches secret when checking (small JSON payload)
- No impact unless rotation occurs
- 30-second grace period minimizes query failures

<a id="local-development"></a>

## Local Development

For local development without AWS:

1. Don't set `DB_SECRET_ID` or `AWS_REGION`
2. Use standard `POSTGRES_*` environment variables
3. Application automatically falls back to environment-based config

<a id="future-enhancements"></a>

## Future Enhancements

1. **EventBridge Integration**: Instead of polling, subscribe to rotation events
2. **Multiple Secrets**: Support for read replicas with different credentials
3. **Connection Pool Metrics**: Expose metrics for monitoring pool health
4. **Configurable Grace Period**: Make the 30-second timeout configurable

<a id="related-files"></a>

## Related Files

- `server/src/utils/secrets-manager.ts` - Secrets Manager client
- `server/src/data/db/sql.ts` - Database connection with auto-refresh
- `infra/iam.tf` - IAM permissions for secret access
- `infra/ecs.tf` - ECS task configuration
- `infra/database.tf` - RDS configuration
