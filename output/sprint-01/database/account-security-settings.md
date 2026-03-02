# Feature: Account Security Settings - Database

## Overview

Database schema for Account Security Settings including tables for pending email/phone changes, comprehensive login history, security audit logging, and data export requests. The schema supports email/phone verification workflows, detailed login tracking with device and location metadata, suspicious activity flagging, account deactivation with grace periods, and GDPR-compliant data export management.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-AM-012

## Database Tables

Five new tables and modifications to users table:
- `users` (modifications): Add deactivation and password change tracking columns
- `pending_email_changes`: Email change verification workflow
- `pending_phone_changes`: Phone change verification with OTP
- `login_history`: Comprehensive login attempt tracking
- `security_audit_log`: Audit trail of security actions
- `data_export_requests`: User data export management

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **ORM**: Entity Framework Core for .NET

## Implementation Notes

Refer to frontend specification for complete table definitions, column specifications, relationships, indexes, and constraints. Key requirements:

- Email verification tokens must expire after 24 hours
- Phone OTP codes must expire after 5 minutes
- Login history must track device, location, and suspicious activity
- Security audit log must capture all security-related actions
- Data export downloads must expire after 7 days
- Account deactivation has 30-day grace period before permanent deletion

