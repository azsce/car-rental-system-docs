# Database Schema Design

```mermaid
erDiagram
    roles ||--o{ users : "defines_access_for"
    users ||--o| driving_licenses : "may_have"
    users ||--o| provider_profiles : "may_have"
    
    roles {
        int id PK
        string name "admin, manager, renter, provider"
        string description
        json permissions "Access rights config"
    }

    users {
        bigint id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        int role_id FK
        boolean is_active "Soft delete flag"
        boolean is_verified "Email/Phone verification"
        timestamp created_at
        timestamp updated_at
    }

    driving_licenses {
        bigint id PK
        bigint user_id FK "Unique - 1:1"
        string license_number
        date expiration_date
        string issuing_country
        string license_front_image
        string license_back_image
        enum status "pending, verified, rejected, expired"
        text rejection_reason
        timestamp verified_at
    }

    provider_profiles {
        bigint id PK
        bigint user_id FK "Unique - 1:1"
        string company_name "Optional"
        string business_reg_number
        string tax_id
        string bank_account_number
        string bank_name
        boolean is_verified
    }

    users ||--o| user_verifications : "has_verification_status"
    users ||--o{ license_verifications : "has_license_verifications"
    users ||--o{ kyc_sessions : "initiates_kyc"
    users ||--o{ kyc_verifications : "has_kyc_verifications"
    users ||--o{ verification_audit_log : "has_audit_log"
    kyc_sessions ||--o{ liveness_checks : "has_liveness_checks"
    kyc_sessions ||--o{ facial_matches : "has_facial_matches"
    kyc_sessions ||--o{ kyc_verifications : "results_in"
    license_verifications ||--o{ license_verifications : "resubmission_of"

    user_verifications {
        bigint id PK
        bigint user_id FK
        boolean email_verified
        datetime email_verified_at
        boolean phone_verified
        datetime phone_verified_at
        boolean license_verified
        datetime license_verified_at
        datetime license_expires_at
        boolean kyc_verified
        datetime kyc_verified_at
        enum kyc_level
        datetime kyc_expires_at
        int trust_score
        int verification_completeness
        datetime created_at
        datetime updated_at
    }

    license_verifications {
        bigint id PK
        bigint user_id FK
        string verification_id UK
        enum status
        string front_image_url
        string back_image_url
        string license_number
        string full_name
        date date_of_birth
        date expiration_date
        string issuing_state
        string license_class
        int ocr_confidence_score
        int data_match_score
        boolean requires_manual_review
        bigint reviewed_by_admin_id FK
        datetime reviewed_at
        text rejection_reason
        bigint resubmission_of FK
        datetime created_at
        datetime updated_at
    }

    kyc_sessions {
        bigint id PK
        string session_id UK
        bigint user_id FK
        enum verification_level
        enum status
        enum document_type
        boolean document_scan_completed
        boolean liveness_check_completed
        boolean facial_match_completed
        boolean database_verification_completed
        datetime expires_at
        datetime completed_at
        datetime created_at
        datetime updated_at
    }

    kyc_verifications {
        bigint id PK
        string verification_id UK
        bigint session_id FK
        bigint user_id FK
        enum status
        enum verification_level
        string document_image_url
        string selfie_image_url
        json ocr_data
        int liveness_score
        int facial_match_score
        json database_verification_result
        int trust_score
        datetime expires_at
        bigint reviewed_by_admin_id FK
        datetime reviewed_at
        text rejection_reason
        datetime created_at
        datetime updated_at
    }

    liveness_checks {
        bigint id PK
        bigint session_id FK
        enum check_type
        boolean passed
        int confidence_score
        int liveness_score
        boolean spoofing_detected
        text feedback
        int attempt_number
        datetime created_at
    }

    facial_matches {
        bigint id PK
        bigint session_id FK
        string selfie_image_url
        string document_photo_url
        int match_score
        boolean matched
        boolean requires_review
        boolean face_detected
        int face_quality_score
        boolean eyes_open
        boolean frontal_face
        int attempt_number
        datetime created_at
    }

    verification_audit_log {
        bigint id PK
        bigint user_id FK
        bigint admin_id FK
        enum verification_type
        string verification_id
        string action
        string previous_status
        string new_status
        text reason
        string ip_address
        string user_agent
        datetime created_at
    }

    %% === USER / AUTH TABLES ===
    users ||--o{ pending_email_changes : "requests"
    users ||--o{ pending_phone_changes : "requests"
    users ||--o{ login_history : "has"
    users ||--o{ security_audit_log : "generates"
    users ||--o{ data_export_requests : "requests"
    users ||--o| user_authentications : "authenticates_via"
    users ||--o{ user_sessions : "has"
    users ||--o{ user_devices : "uses"
    users ||--o{ auth_audit_logs : "has"
    users ||--o{ password_reset_tokens : "has"
    users ||--o{ email_verification_tokens : "has"
    users ||--o{ phone_verification_codes : "has"
    users ||--o{ social_accounts : "linked_to"
    users ||--o{ social_login_providers : "linked_to"
    users ||--o{ oauth_states : "initiates"
    users ||--o| user_two_factor : "has"
    user_two_factor ||--o{ user_backup_codes : "has"
    user_two_factor ||--o{ user_trusted_devices : "has"
    users ||--o{ two_factor_audit_log : "has"
    users ||--o{ user_addresses : "has"
    users ||--o{ emergency_contacts : "has"
    users ||--o| user_personas : "has"
    users ||--o| user_preferences : "has"
    users ||--o{ saved_locations : "has"
    users ||--o{ location_history : "has"
    users ||--o| privacy_settings : "has"
    users ||--o{ account_deletion_requests : "requests"
    users ||--o{ privacy_settings_audit_log : "has"
    users ||--o| trust_scores : "has"
    trust_scores ||--o{ trust_score_history : "has"
    trust_scores ||--o{ trust_score_components : "has"
    trust_scores ||--o{ improvement_tips : "has"

    %% === SUPPLIER / VEHICLE TABLES ===
    users ||--o{ suppliers : "manages"
    suppliers ||--o{ supplier_locations : "has"
    suppliers ||--o{ supplier_specializations : "has"
    suppliers ||--o{ supplier_metrics : "has"
    suppliers ||--o{ supplier_certifications : "has"
    suppliers ||--o{ vehicles : "owns"
    vehicles ||--o{ vehicle_images : "has"
    vehicles ||--o{ vehicle_features : "has"
    vehicles ||--o{ vehicle_accessibility : "has"
    features ||--o{ vehicle_features : "used_in"
    accessibility_features ||--o{ vehicle_accessibility : "used_in"
    vehicles ||--o| vehicle_status : "has"
    vehicles ||--o{ vehicle_control_log : "has"
    vehicles ||--o{ vehicle_locks : "has"
    vehicles ||--o{ vehicle_availability_cache : "has"
    users ||--o{ user_distance_cache : "has"
    users ||--o{ user_recommendation_scores : "has"

    %% === LOCATION / SEARCH TABLES ===
    locations ||--o{ business_hours : "has"
    locations ||--o{ location_pricing_history : "has"
    pricing_regions ||--o{ location_pricing_history : "has"
    landmarks ||--o{ landmark_locations : "near"
    locations ||--o{ landmark_locations : "has"
    locations ||--o{ one_way_rental_fees : "pickup_for"
    locations ||--o{ location_search_cache : "cached_in"

    %% === BOOKING TABLES ===
    users ||--o{ bookings : "makes"
    vehicles ||--o{ bookings : "booked_in"
    locations ||--o{ bookings : "pickup_location"
    bookings ||--o{ booking_cancellations : "cancelled_via"
    bookings ||--o{ trip_tracking : "tracked_in"
    bookings ||--o{ booking_exports : "exported_as"
    bookings ||--o{ additional_drivers : "has"
    bookings ||--o{ booking_customers : "has"
    bookings ||--o{ booking_additional_drivers : "has"
    insurance_options ||--o{ booking_insurance : "used_in"
    bookings ||--o{ booking_insurance : "has"
    services ||--o{ service_inventory : "has"
    vehicles ||--o{ service_inventory : "for"
    services ||--o{ booking_services : "used_in"
    bookings ||--o{ booking_services : "has"
    terms_documents ||--o{ terms_acceptances : "accepted_via"
    bookings ||--o{ terms_acceptances : "has"
    users ||--o{ terms_acceptances : "accepts"
    bookings ||--o| booking_pricing : "priced_as"
    bookings ||--o{ trips : "results_in"
    trips ||--o{ trip_extensions : "extended_by"

    %% === PAYMENT TABLES ===
    users ||--o{ payment_methods : "has"
    bookings ||--o{ booking_payments : "paid_via"
    payment_methods ||--o{ booking_payments : "used_in"
    payment_methods ||--o{ payment_transactions : "has"
    payment_transactions ||--o{ payment_authorizations : "authorized_by"
    payment_transactions ||--o{ refund_transactions : "refunded_via"

    %% === DISCOUNT TABLES ===
    discount_codes ||--o{ discount_usage : "used_in"
    bookings ||--o{ discount_usage : "has"
    users ||--o{ discount_usage : "uses"
    discount_codes ||--o{ discount_vehicle_categories : "applies_to"
    discount_codes ||--o{ discount_validation_log : "validated_in"

    %% === REVIEW TABLES ===
    vehicles ||--o{ reviews : "has"
    users ||--o{ reviews : "writes"
    bookings ||--o{ reviews : "verified_by"
    reviews ||--o{ review_photos : "has"
    reviews ||--o{ review_votes : "has"
    reviews ||--o{ review_responses : "has"

    %% === COMPLIANCE / AUDIT TABLES ===
    saq_assessments ||--o{ saq_questions : "has"
    saq_questions ||--o{ saq_evidence : "has"
    vulnerability_scans ||--o{ vulnerabilities : "has"
    penetration_tests ||--o{ penetration_test_findings : "has"
    compliance_reports ||--o{ compliance_evidence : "has"

    %% === SECURITY MONITORING TABLES ===
    users ||--o{ access_audit_logs : "audited_in"
    security_incidents ||--o{ security_alert_notifications : "triggers"

    pending_email_changes {
        string id PK
        string user_id FK
        string new_email
        string verification_token
        boolean is_verified
        datetime requested_at
        datetime expires_at
    }

    pending_phone_changes {
        string id PK
        string user_id FK
        string new_phone
        string verification_code
        boolean is_verified
        datetime requested_at
        datetime expires_at
    }

    login_history {
        string id PK
        string user_id FK
        string email
        string phone
        enum login_method
        string social_provider
        string device_type
        string browser
        string operating_system
        string ip_address
        string location
        boolean success
        string failure_reason
        datetime timestamp
    }

    security_audit_log {
        string id PK
        string user_id FK
        string event_type
        text event_description
        string ip_address
        string device_fingerprint
        datetime timestamp
    }

    data_export_requests {
        string id PK
        string user_id FK
        enum request_status
        string export_file_url
        datetime requested_at
        datetime completed_at
        datetime expires_at
    }

    user_authentications {
        string id PK
        string user_id FK
        enum auth_method
        string password_hash
        string password_salt
        datetime last_password_change
        boolean password_reset_required
        boolean two_factor_enabled
        enum two_factor_method
        string two_factor_secret
        text backup_codes
        datetime created_at
        datetime updated_at
    }

    user_sessions {
        string id PK
        string user_id FK
        string session_token UK
        string refresh_token UK
        string device_id
        string device_type
        string browser
        string operating_system
        string ip_address
        string location
        string user_agent
        boolean is_active
        boolean remember_me
        datetime created_at
        datetime last_activity_at
        datetime expires_at
    }

    user_devices {
        string id PK
        string user_id FK
        string device_fingerprint
        string device_type
        string browser
        string operating_system
        string ip_address
        string location
        boolean is_trusted
        datetime first_seen
        datetime last_seen
    }

    auth_audit_logs {
        string id PK
        string user_id FK
        enum event_type
        string event_method
        string ip_address
        string device_type
        string browser
        string operating_system
        string location
        boolean success
        string failure_reason
        json metadata
        datetime timestamp
    }

    password_reset_tokens {
        string id PK
        string user_id FK
        string token UK
        datetime expires_at
        boolean is_used
        datetime used_at
        datetime created_at
    }

    email_verification_tokens {
        string id PK
        string user_id FK
        string email
        string token UK
        datetime expires_at
        boolean is_used
        datetime used_at
        datetime created_at
    }

    phone_verification_codes {
        string id PK
        string user_id FK
        string phone_number
        string code
        enum purpose
        datetime expires_at
        boolean is_used
        datetime used_at
        int attempt_count
        datetime created_at
    }

    social_accounts {
        string id PK
        string user_id FK
        string provider
        string provider_user_id
        string display_name
        string email
        string profile_photo_url
        datetime linked_at
        datetime last_used_at
    }

    social_login_providers {
        string id PK
        string user_id FK
        enum provider
        string provider_user_id
        string email
        string display_name
        string profile_photo_url
        text access_token
        text refresh_token
        datetime token_expires_at
        datetime linked_at
        datetime last_used_at
    }

    oauth_states {
        string id PK
        string state_token UK
        string user_id FK
        string provider
        datetime expires_at
        boolean used
        datetime created_at
    }

    user_two_factor {
        string id PK
        string user_id FK
        enum two_fa_method
        string totp_secret
        boolean is_enabled
        boolean backup_codes_generated
        datetime created_at
        datetime last_used_at
    }

    user_backup_codes {
        string id PK
        string user_two_factor_id FK
        string code_hash
        boolean is_used
        datetime used_at
        datetime generated_at
    }

    user_trusted_devices {
        string id PK
        string user_two_factor_id FK
        string device_fingerprint
        string device_name
        datetime last_used_at
        datetime expires_at
        datetime added_at
    }

    two_factor_audit_log {
        string id PK
        string user_id FK
        enum action_type
        string ip_address
        datetime action_timestamp
    }

    user_addresses {
        string address_id PK
        string user_id FK
        enum address_type
        string street
        string city
        string state
        string postal_code
        string country
        decimal latitude
        decimal longitude
        boolean is_primary
        datetime created_at
        datetime updated_at
    }

    emergency_contacts {
        string contact_id PK
        string user_id FK
        string contact_name
        string contact_phone
        string relationship
        boolean is_primary
        datetime created_at
        datetime updated_at
    }

    user_personas {
        string persona_id PK
        string user_id FK
        enum assigned_persona
        int persona_score
        json persona_preferences
        datetime assigned_at
        datetime last_updated
    }

    user_preferences {
        string preference_id PK
        string user_id FK
        boolean email_notifications
        boolean sms_notifications
        boolean push_notifications
        json notification_types
        boolean quiet_hours_enabled
        time quiet_hours_start
        time quiet_hours_end
        json default_vehicle_types
        string default_insurance_tier
        json default_extras
        json accessibility_requirements
        enum profile_visibility
        boolean data_sharing_enabled
        boolean marketing_opt_in
        datetime created_at
        datetime updated_at
    }

    saved_locations {
        string location_id PK
        string user_id FK
        string nickname
        string address
        decimal latitude
        decimal longitude
        enum location_type
        datetime created_at
        datetime updated_at
    }

    location_history {
        string id PK
        string user_id FK
        string address
        decimal latitude
        decimal longitude
        datetime visited_at
        int visit_count
    }

    geocoding_cache {
        string id PK
        string search_query
        decimal latitude
        decimal longitude
        string address
        datetime cached_at
        int ttl
    }

    privacy_settings {
        string id PK
        string user_id FK
        boolean data_sharing_enabled
        boolean marketing_opt_in
        boolean analytics_opt_in
        boolean third_party_sharing
        json cookie_preferences
        datetime created_at
        datetime updated_at
    }

    account_deletion_requests {
        string id PK
        string user_id FK
        datetime request_date
        text deletion_reason
        enum status
        datetime scheduled_deletion_date
        datetime completed_at
    }

    privacy_settings_audit_log {
        string id PK
        string user_id FK
        string setting_changed
        string old_value
        string new_value
        datetime changed_at
    }

    trust_scores {
        string id PK
        string user_id FK
        decimal overall_score
        datetime calculated_at
        datetime next_recalculation_at
    }

    trust_score_history {
        string id PK
        string trust_score_id FK
        decimal score_value
        datetime calculated_at
    }

    trust_score_components {
        string id PK
        string trust_score_id FK
        string component_name
        decimal component_score
        decimal weight_percentage
    }

    improvement_tips {
        string id PK
        string trust_score_id FK
        string tip_category
        text tip_text
        json action_items
        datetime created_at
    }

    suppliers {
        string id PK
        string supplier_name
        string contact_email
        string contact_phone
        string business_license
        string tax_id
        string country
        datetime created_at
        boolean is_verified
    }

    supplier_locations {
        string id PK
        string supplier_id FK
        string location_name
        string address
        string city
        string country
        decimal latitude
        decimal longitude
        string phone
        datetime created_at
    }

    supplier_specializations {
        string id PK
        string supplier_id FK
        string specialization_category
        string specialization_value
    }

    supplier_metrics {
        string id PK
        string supplier_id FK
        date metric_date
        int total_bookings
        int completed_bookings
        int cancelled_bookings
        decimal average_rating
        int response_time_hours
    }

    supplier_certifications {
        string id PK
        string supplier_id FK
        string certification_name
        string issuing_body
        date issue_date
        date expiry_date
        string certificate_url
        boolean is_valid
    }

    vehicles {
        string id PK
        string supplier_id FK
        string make
        string model
        int year
        string vin UK
        string license_plate UK
        string color
        string body_type
        enum transmission
        enum fuel_type
        int seats
        int luggage_capacity
        decimal price_per_day
        enum availability_status
        string location_id FK
        json features
        int rental_count
        decimal average_rating
        boolean is_verified
        datetime created_at
        datetime updated_at
    }

    vehicle_images {
        string id PK
        string vehicle_id FK
        string image_url
        enum image_type
        int display_order
        datetime uploaded_at
    }

    features {
        string id PK
        string feature_name
        string feature_category
        string feature_icon
        boolean is_active
    }

    vehicle_features {
        string id PK
        string vehicle_id FK
        string feature_id FK
        datetime created_at
    }

    accessibility_features {
        string id PK
        string feature_name
        datetime created_at
    }

    vehicle_accessibility {
        string id PK
        string vehicle_id FK
        string accessibility_feature_id FK
        datetime created_at
    }

    vehicle_status {
        string id PK
        string vehicle_id FK
        enum status
        datetime last_status_change
        text maintenance_notes
        enum damage_level
        datetime availability_updated_at
    }

    vehicle_control_log {
        string id PK
        string vehicle_id FK
        string booking_id FK
        enum action_type
        string performed_by FK
        datetime timestamp
    }

    vehicle_locks {
        string id PK
        string vehicle_id FK
        string booking_id FK
        enum lock_type
        enum lock_status
        datetime last_status_update
        datetime activation_timestamp
        datetime deactivation_timestamp
    }

    vehicle_availability_cache {
        string id PK
        string vehicle_id FK
        boolean available
        date next_available_date
        datetime cached_at
    }

    user_distance_cache {
        string id PK
        string user_id FK
        string vehicle_id FK
        decimal distance_km
        datetime cached_at
        int ttl
    }

    user_recommendation_scores {
        string id PK
        string user_id FK
        string vehicle_id FK
        decimal recommendation_score
        json score_factors
        datetime calculated_at
    }

    locations {
        string id PK
        string location_name
        string address
        string city
        string state
        string country
        string postal_code
        decimal latitude
        decimal longitude
        enum location_type
        json operating_hours
        string phone
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    business_hours {
        string id PK
        string location_id FK
        enum day_of_week
        time opening_time
        time closing_time
        boolean is_closed
    }

    pricing_regions {
        string id PK
        string region_name
        string region_code
        decimal base_price_multiplier
        boolean surge_pricing_enabled
        datetime created_at
    }

    location_pricing_history {
        string id PK
        string location_id FK
        date date
        decimal base_price
        string pricing_region_id FK
        string pricing_tier
        datetime effective_from
    }

    landmarks {
        string id PK
        string landmark_name
        string landmark_type
        decimal latitude
        decimal longitude
        string city_id
    }

    landmark_locations {
        string id PK
        string landmark_id FK
        string location_id FK
        decimal distance_km
    }

    one_way_rental_fees {
        string id PK
        string pickup_location_id FK
        string dropoff_location_id FK
        decimal one_way_fee
        boolean active
        datetime created_at
    }

    location_search_cache {
        string id PK
        string search_query
        string location_id FK
        int search_count
        datetime last_searched
    }

    filter_analytics {
        string id PK
        string filter_category
        string filter_value
        int usage_count
        datetime last_used
    }

    quick_date_presets {
        string id PK
        string preset_name
        int duration_days
        boolean is_active
        datetime created_at
    }

    bookings {
        string id PK
        string user_id FK
        string vehicle_id FK
        string pickup_location_id FK
        string dropoff_location_id FK
        datetime pickup_date
        datetime dropoff_date
        enum status
        decimal total_cost
        string currency
        string payment_method
        string booking_number UK
        datetime created_at
        datetime updated_at
    }

    booking_cancellations {
        string id PK
        string booking_id FK
        string cancellation_reason
        decimal refund_amount
        enum refund_status
        string cancelled_by FK
        datetime cancelled_at
        datetime refund_processed_at
    }

    trip_tracking {
        string id PK
        string booking_id FK
        string vehicle_id FK
        decimal distance_traveled
        datetime estimated_arrival
        datetime actual_arrival
        enum trip_status
        datetime last_updated
    }

    booking_exports {
        string id PK
        string booking_id FK
        enum export_format
        string file_url
        datetime export_date
        string exported_by FK
    }

    additional_drivers {
        string id PK
        string booking_id FK
        string driver_name
        string driver_license_number
        date driver_license_expiry
        date date_of_birth
        string phone_number
        string email
        datetime added_at
        enum approval_status
    }

    booking_customers {
        string id PK
        string booking_id FK
        string customer_id FK
        string customer_email
        string customer_phone
        string customer_name
    }

    booking_additional_drivers {
        string id PK
        string booking_id FK
        string driver_id FK
        string driver_name
        string driver_license
        date license_expiry
    }

    insurance_options {
        string id PK
        string insurance_type
        decimal premium_cost
        decimal deductible
        decimal coverage_limit
        datetime created_at
    }

    booking_insurance {
        string id PK
        string booking_id FK
        string insurance_option_id FK
        decimal premium_amount
        string coverage_type
        datetime selected_at
    }

    services {
        string id PK
        string service_name
        enum service_type
        decimal base_price
        datetime created_at
    }

    service_inventory {
        string id PK
        string service_id FK
        string vehicle_id FK
        int quantity_available
        int quantity_reserved
        datetime updated_at
    }

    booking_services {
        string id PK
        string booking_id FK
        string service_id FK
        int quantity
        decimal price
        datetime added_at
    }

    terms_documents {
        string id PK
        string document_name
        int document_version
        date effective_date
        datetime created_at
    }

    terms_acceptances {
        string id PK
        string user_id FK
        string booking_id FK
        string terms_document_id FK
        datetime accepted_at
        string ip_address
        text user_agent
    }

    booking_pricing {
        string id PK
        string booking_id FK
        decimal base_price
        decimal distance_price
        decimal insurance_price
        decimal service_price
        decimal tax
        decimal total_price
    }

    trips {
        string id PK
        string booking_id FK
        string user_id FK
        string vehicle_id FK
        enum status
        int extensions_count
        int total_extensions_hours
    }

    trip_extensions {
        string id PK
        string trip_id FK
        datetime original_return_date
        datetime new_return_date
        int extension_hours
        decimal extension_cost
        enum status
        datetime requested_at
        datetime approved_at
    }

    payment_methods {
        string id PK
        string user_id FK
        enum payment_type
        string token
        string last_four_digits
        string card_expiry
        boolean is_default
        boolean is_active
        datetime created_at
    }

    booking_payments {
        string id PK
        string booking_id FK
        string payment_method_id FK
        decimal amount
        enum payment_status
        string transaction_id
        datetime created_at
    }

    payment_transactions {
        string id PK
        string payment_method_id FK
        enum transaction_type
        decimal amount
        string currency
        enum status
        string gateway_reference
        datetime created_at
        datetime completed_at
    }

    payment_authorizations {
        string id PK
        string payment_transaction_id FK
        string authorization_code
        decimal amount
        datetime expires_at
        boolean is_captured
        datetime capture_date
    }

    refund_transactions {
        string id PK
        string payment_transaction_id FK
        decimal refund_amount
        string refund_reason
        enum status
        datetime created_at
        datetime completed_at
    }

    payment_gateway_webhooks {
        string id PK
        string gateway_name
        string webhook_event_type
        json event_data
        string transaction_id
        boolean processed
        datetime received_at
        datetime processed_at
    }

    discount_codes {
        string id PK
        string code UK
        enum discount_type
        decimal discount_value
        decimal max_discount_amount
        int usage_limit
        int current_usage
        datetime valid_from
        datetime valid_to
        boolean active
        datetime created_at
    }

    discount_usage {
        string id PK
        string discount_code_id FK
        string booking_id FK
        string user_id FK
        decimal discount_amount
        datetime used_at
    }

    discount_vehicle_categories {
        string id PK
        string discount_code_id FK
        string vehicle_category
        boolean is_applicable
    }

    discount_validation_log {
        string id PK
        string discount_code_id FK
        datetime validation_attempt
        enum validation_status
        string reason
    }

    reviews {
        string review_id PK
        string vehicle_id FK
        string user_id FK
        string user_name
        boolean verified_booking
        string booking_id FK
        datetime review_date
        datetime last_modified
        decimal overall_rating
        decimal cleanliness
        decimal performance
        decimal value
        decimal accuracy
        decimal communication
        text review_text
        int helpful_votes
        int unhelpful_votes
        enum moderation_status
    }

    review_photos {
        string photo_id PK
        string review_id FK
        string url
        string thumbnail_url
        int width
        int height
        datetime uploaded_at
    }

    review_votes {
        string vote_id PK
        string review_id FK
        string user_id FK
        enum vote_type
        datetime voted_at
    }

    review_responses {
        string response_id PK
        string review_id FK
        string host_id FK
        text response_text
        datetime response_date
        string host_name
        string host_photo
    }

    saq_assessments {
        string id PK
        date assessment_date
        enum assessment_type
        string assessor_name
        int total_questions
        int compliant_answers
        decimal compliance_percentage
        string report_url
        datetime created_at
    }

    saq_questions {
        string id PK
        string saq_assessment_id FK
        text question_text
        string requirement_area
        enum compliance_status
        boolean evidence_provided
        text notes
    }

    saq_evidence {
        string id PK
        string saq_question_id FK
        string evidence_type
        text evidence_description
        string evidence_file_url
        datetime uploaded_at
    }

    vulnerability_scans {
        string id PK
        date scan_date
        string scan_type
        int vulnerabilities_found
        int critical_count
        int high_count
        int medium_count
        int low_count
        string scan_report_url
        datetime created_at
    }

    vulnerabilities {
        string id PK
        string vulnerability_scan_id FK
        string cve_id
        string vulnerability_type
        enum severity
        text description
        text remediation
        string affected_component
    }

    penetration_tests {
        string id PK
        date test_date
        text test_scope
        string tester_name
        string test_type
        string overall_rating
        string report_url
        datetime created_at
    }

    penetration_test_findings {
        string id PK
        string penetration_test_id FK
        string finding_type
        enum severity
        text description
        text remediation
        string identified_in
    }

    compliance_reports {
        string id PK
        date report_date
        string report_type
        enum compliance_status
        text summary
        string report_url
        datetime created_at
    }

    third_party_assessments {
        string id PK
        date assessment_date
        string third_party_name
        string assessment_type
        text findings_summary
        string report_url
        decimal assessment_score
    }

    compliance_evidence {
        string id PK
        string compliance_report_id FK
        string evidence_category
        text evidence_description
        string evidence_file_url
        datetime uploaded_at
    }

    security_events {
        string id PK
        string event_type
        enum event_severity
        string affected_system
        text event_description
        datetime detection_time
        enum response_status
        datetime resolved_at
    }

    access_audit_logs {
        string id PK
        string user_id FK
        string access_type
        string resource_accessed
        boolean access_granted
        string ip_address
        datetime timestamp
    }

    intrusion_detection_alerts {
        string id PK
        string alert_type
        enum severity
        string detected_threat
        string source_ip
        datetime detection_time
        string response_action
    }

    file_integrity_violations {
        string id PK
        string file_path
        string violation_type
        string expected_hash
        string actual_hash
        datetime detected_at
        string remediation_status
    }

    security_incidents {
        string id PK
        string incident_type
        enum incident_severity
        text incident_description
        datetime detection_time
        text root_cause
        enum resolution_status
        datetime resolved_at
    }

    security_alert_notifications {
        string id PK
        string security_incident_id FK
        string recipient_email
        string notification_type
        datetime sent_at
        boolean acknowledged
        datetime acknowledged_at
    }
```

