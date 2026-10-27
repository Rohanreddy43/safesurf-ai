export type ScanStatus = 'safe' | 'suspicious' | 'malicious';

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  raw_key?: string;
}

export interface SecurityModules {
  url_validation: {
    is_valid: boolean;
    is_https: boolean;
    is_ip: boolean;
    has_punycode: boolean;
    subdomain_count: number;
    typosquatting_detected: boolean;
    target_brand_mimicked?: string;
    flags: string[];
    status: string;
    score_impact: number;
    hostname: string;
    url_length: number;
  };
  dns: {
    records: {
      A: string[];
      AAAA: string[];
      MX: string[];
      TXT: string[];
      NS: string[];
      CNAME: string[];
    };
    flags: string[];
    has_a_record: boolean;
    has_mx_record: boolean;
    has_spf: boolean;
  };
  whois: {
    domain_age_days?: number;
    registrar: string;
    creation_date?: string;
    expiration_date?: string;
    owner: string;
    flags: string[];
  };
  ssl: {
    valid: boolean;
    issuer: string;
    expiry_date?: string;
    days_until_expiry?: number;
    tls_version: string;
    cipher_suite: string;
    is_self_signed: boolean;
    flags: string[];
  };
  hosting: {
    ip_address: string;
    country: string;
    country_code: string;
    city: string;
    isp: string;
    asn: string;
    latitude: number;
    longitude: number;
    flags: string[];
  };
  redirects: {
    redirect_chain: { hop: number; url: string; status_code: number }[];
    hop_count: number;
    final_destination: string;
    has_infinite_loop: boolean;
    cross_domain_count: number;
    flags: string[];
  };
  html_security: {
    findings: {
      hidden_iframes: number;
      password_forms: number;
      js_redirects: boolean;
      obfuscated_js: boolean;
      base64_scripts: number;
      inline_event_handlers: number;
      crypto_miners: boolean;
    };
    flags: string[];
  };
  security_headers: {
    header_grades: Record<string, string>;
    grade: string;
    missing_count: number;
    flags: string[];
  };
  threat_intelligence: {
    providers: Record<string, string>;
    flagged_count: number;
    status: string;
    flags: string[];
  };
  ai_risk_engine: {
    final_score: number;
    status: ScanStatus;
    explanation: string;
    deductions: { factor: string; points: number; reason: string }[];
    bonuses: { factor: string; points: number; reason: string }[];
    breakdown: {
      base_score: number;
      total_deductions: number;
      total_bonuses: number;
    };
  };
  favicon_hash: {
    status: string;
    favicon_found: boolean;
    favicon_url?: string;
    shodan_mmh3_hash?: number;
    md5_hash?: string;
    brand_matched?: string | null;
    is_favicon_spoofed: boolean;
    details: string;
  };
  visual_similarity: {
    status: string;
    is_cloned_brand: boolean;
    matched_brand?: string | null;
    similarity_score: number;
    detection_reasons: string[];
    inspected_targets_count: number;
  };
  ai_vision_engine: {
    status: string;
    has_phishing_intent: boolean;
    content_phishing_score: number;
    detected_phishing_triggers: string[];
    analyzed_text_length: number;
    vision_screenshot_analyzed: boolean;
    layout_classification: string;
  };
  behavioral_sandbox: {
    status: string;
    sandbox_execution: string;
    risk_rating: string;
    suspicious_behavior_detected: boolean;
    redirect_hop_count: number;
    auto_download_triggered: boolean;
    downloaded_files: string[];
    has_alert_loop: boolean;
    has_notification_abuse: boolean;
    behavioral_alerts: string[];
  };
  community_threat: {
    status: string;
    is_community_flagged: boolean;
    community_reports_count: number;
    threat_status: string;
  };
  content_category: {
    is_adult: boolean;
    is_gambling: boolean;
    is_illegal: boolean;
    categories: string[];
    primary_category: string;
    warnings: string[];
  };
  crawler_engine: {
    status: string;
    discovered_routes_count: number;
    discovered_routes: string[];
    hidden_login_pages: string[];
    form_endpoints: string[];
    external_action_targets: string[];
    has_hidden_login_portal: boolean;
    has_external_form_posts: boolean;
  };
  js_analysis: {
    status: string;
    risk_level: string;
    total_findings: number;
    findings: string[];
    has_obfuscated_js: boolean;
    has_keylogger: boolean;
    has_fingerprinting: boolean;
    has_crypto_miner: boolean;
    has_websocket_pipe: boolean;
  };
  phishing_kit: {
    status: string;
    phishing_kit_detected: boolean;
    has_exfiltration_pipe: boolean;
    detected_templates: string[];
    matched_kit_count: number;
    fingerprint_confidence: string;
  };
  site_legitimacy: {
    status: string;
    legitimacy_score: number;
    has_robots_txt: boolean;
    has_sitemap_xml: boolean;
    has_privacy_policy: boolean;
    probed_assets: Record<string, boolean>;
    is_isolated_phishing_kit: boolean;
    classification: string;
  };
  ssl_dns_intelligence: {
    status: string;
    trust_score: number;
    trust_grade: string;
    is_newly_registered: boolean;
    domain_age_days?: number | null;
    ssl_valid: boolean;
    is_self_signed_ssl: boolean;
    has_mx_records: boolean;
    has_spf_record: boolean;
    hosting_ip: string;
    hosting_country: string;
    hosting_isp: string;
    risk_factors: string[];
  };
}

export interface ScanReport {
  id: number;
  url: string;
  domain: string;
  risk_score: number;
  status: ScanStatus;
  summary?: string;
  is_saved: boolean;
  created_at: string;
  report_data?: {
    execution_time_seconds: number;
    modules: SecurityModules;
  };
}

export interface GlobalStats {
  total_scans: number;
  threats_detected: number;
  avg_scan_time: number;
  safe_urls: number;
  suspicious_urls: number;
  malicious_urls: number;
}
