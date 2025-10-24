terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ------------------------------------------------------------
# Get default VPC and subnet group
# ------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_db_subnet_group" "default" {
  # Lookup the existing default VPC subnet group by its real name
  name = "default-vpc-059af42cd1884a8cc"
}

data "aws_security_group" "default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}

# ------------------------------------------------------------
# RDS PostgreSQL instance (AWS-managed password)
# ------------------------------------------------------------
resource "aws_db_instance" "dev_db_comm_ng" {
  identifier             = "dev-db-comm-ng"
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  db_name                = "comm_ng"

  # Storage
  allocated_storage      = 20
  max_allocated_storage  = 20 # disables autoscaling
  storage_type           = "gp3"

  # Authentication
  username                     = "comm_ng_dev_user"
  manage_master_user_password   = true   # <-- AWS generates & stores the password

  # Network
  publicly_accessible    = true
  vpc_security_group_ids = [data.aws_security_group.default.id]
  db_subnet_group_name   = data.aws_db_subnet_group.default.name

  # Availability
  multi_az               = false

  # Monitoring & logs
  monitoring_interval    = 0  # standard monitoring only
  enabled_cloudwatch_logs_exports = [
    "postgresql",
    "iam-db-auth-error"
  ]

  # Backups & maintenance (default)
  backup_retention_period = 0 # dev/test template
  skip_final_snapshot      = true
  deletion_protection      = false

  # Tags
  tags = {
    Name        = "dev-db-comm-ng"
    Environment = "dev"
  }
}

# ------------------------------------------------------------
# Output information
# ------------------------------------------------------------
output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.dev_db_comm_ng.endpoint
}

output "db_master_username" {
  description = "Master username"
  value       = aws_db_instance.dev_db_comm_ng.username
}

output "db_master_password_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret where the password is stored"
  value       = aws_db_instance.dev_db_comm_ng.master_user_secret[0].secret_arn
}
