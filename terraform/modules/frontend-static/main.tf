# Create a GCS bucket for hosting the static website
resource "google_storage_bucket" "frontend_static" {
  name = "${var.service_name}-static"
  location = var.region

  # Enable website hosting
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html" # For SPA routing, redirect all 404s to index.html
  }

  # Configure uniform bucket-level access
  uniform_bucket_level_access = true

  # Set storage class to standard
  storage_class = "STANDARD"

  # Add CORS configuration for API requests
  cors {
    origin = ["*"]
    method = ["GET", "HEAD", "OPTIONS"]
    response_header = ["Content-Type", "Access-Control-Allow-Origin"]
    max_age_seconds = 3600
  }

  # Add labels
  labels = var.labels

  # Allow public access and cleanup on destroy
  force_destroy = true
}

# Make the bucket publicly accessible
resource "google_storage_bucket_iam_member" "frontend_static_public" {
  bucket = google_storage_bucket.frontend_static.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Create a load balancer with HTTPS for the static website
resource "google_compute_backend_bucket" "frontend_static" {
  name        = "${var.service_name}-backend"
  bucket_name = google_storage_bucket.frontend_static.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400

    # Configure negative caching for specific response codes
    negative_caching_policy {
      code = 404
      ttl  = 0  # Don't cache 404 responses to ensure SPA routing works
    }
  }
}

# Reserve a static external IP address
resource "google_compute_global_address" "frontend_static" {
  name = "${var.service_name}-ip"
}

# Create a URL map
resource "google_compute_url_map" "frontend_static" {
  name            = "${var.service_name}-url-map"
  default_service = google_compute_backend_bucket.frontend_static.id

  # For SPA routing, we need to configure path matchers to handle client-side routes
  # This ensures that requests to routes like /upload are handled by the SPA
  host_rule {
    hosts        = ["*"]
    path_matcher = "spa-routes"
  }

  path_matcher {
    name            = "spa-routes"
    default_service = google_compute_backend_bucket.frontend_static.id

    # Static assets should be served directly
    path_rule {
      paths   = ["/assets/*", "/config.js", "/favicon.ico", "/robots.txt"]
      service = google_compute_backend_bucket.frontend_static.id
    }

    # All other paths should serve index.html to support SPA routing
    path_rule {
      paths   = ["/*"]
      service = google_compute_backend_bucket.frontend_static.id
    }
  }
}

# Create an HTTP target proxy
resource "google_compute_target_http_proxy" "frontend_static" {
  name    = "${var.service_name}-http-proxy"
  url_map = google_compute_url_map.frontend_static.id
}

# Create a global forwarding rule for HTTP
resource "google_compute_global_forwarding_rule" "frontend_static_http" {
  count = var.frontend_domain_name == "" ? 1 : 0

  name       = "${var.service_name}-http-rule"
  target     = google_compute_target_http_proxy.frontend_static.id
  port_range = "80"
  ip_address = google_compute_global_address.frontend_static.address
}

# Create a global forwarding rule for HTTP redirect when using HTTPS
resource "google_compute_global_forwarding_rule" "http_to_https" {
  count = var.frontend_domain_name != "" ? 1 : 0

  name       = "${var.service_name}-http-to-https-rule"
  target     = google_compute_target_http_proxy.https_redirect[0].id
  port_range = "80"
  ip_address = google_compute_global_address.frontend_static.address
}

# Set up HTTPS with a managed certificate
# Only create the certificate if a domain name is provided
resource "google_compute_managed_ssl_certificate" "frontend_static" {
  count = var.frontend_domain_name != "" ? 1 : 0

  name = "${var.service_name}-cert"
  managed {
    domains = [var.frontend_domain_name]
  }
}

# Create an HTTPS target proxy with the SSL certificate
resource "google_compute_target_https_proxy" "frontend_static" {
  count = var.frontend_domain_name != "" ? 1 : 0

  name    = "${var.service_name}-https-proxy"
  url_map = google_compute_url_map.frontend_static.id
  ssl_certificates = [google_compute_managed_ssl_certificate.frontend_static[0].id]
}

# Create a global forwarding rule for HTTPS
resource "google_compute_global_forwarding_rule" "frontend_static_https" {
  count = var.frontend_domain_name != "" ? 1 : 0

  name       = "${var.service_name}-https-rule"
  target     = google_compute_target_https_proxy.frontend_static[0].id
  port_range = "443"
  ip_address = google_compute_global_address.frontend_static.address
}

# Create a DNS zone for the domain if manage_dns is true
resource "google_dns_managed_zone" "frontend_domain" {
  count = var.frontend_domain_name != "" && var.manage_dns ? 1 : 0

  name        = replace(var.frontend_domain_name, ".", "-")
  dns_name    = "${var.frontend_domain_name}."
  description = "DNS zone for ${var.frontend_domain_name}"
  labels      = var.labels
}

# Create an A record pointing to the static IP
resource "google_dns_record_set" "frontend_domain_a" {
  count = var.frontend_domain_name != "" && var.manage_dns ? 1 : 0

  name         = "${var.frontend_domain_name}."
  managed_zone = google_dns_managed_zone.frontend_domain[0].name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.frontend_static.address]
}

# Add HTTP to HTTPS redirect
resource "google_compute_url_map" "https_redirect" {
  count = var.frontend_domain_name != "" ? 1 : 0

  name            = "${var.service_name}-https-redirect"
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

# Create an HTTP target proxy for the redirect
resource "google_compute_target_http_proxy" "https_redirect" {
  count = var.frontend_domain_name != "" ? 1 : 0

  name    = "${var.service_name}-http-redirect-proxy"
  url_map = google_compute_url_map.https_redirect[0].id
}
