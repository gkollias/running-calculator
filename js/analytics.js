// ===== ANALYTICS MODULE =====
// Handles all analytics tracking and events

const Analytics = {
    // Track calculator usage
    trackCalculator(calculatorType, additionalData = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculate', {
                'event_category': 'calculator',
                'event_label': calculatorType,
                'value': additionalData
            });
        }
        
        // Update internal usage stats
        const stats = Storage.getUserStats();
        stats.calculatorUsage = stats.calculatorUsage || {};
        stats.calculatorUsage[calculatorType] = (stats.calculatorUsage[calculatorType] || 0) + 1;
        
        // Update favorite calculator
        if (Object.keys(stats.calculatorUsage).length > 0) {
            const maxUsage = Math.max(...Object.values(stats.calculatorUsage));
            stats.favoriteCalculator = Object.keys(stats.calculatorUsage).find(
                key => stats.calculatorUsage[key] === maxUsage
            );
        }
        
        Storage.saveUserStats(stats);
    },

    // Track calculator completion
    trackCalculatorComplete(calculatorType, value = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_complete', {
                'event_category': 'calculator',
                'event_label': calculatorType,
                'value': value
            });
        }
    },

    // Track scroll depth
    trackScrollDepth() {
        const scrollDepths = [25, 50, 75, 90];
        this.scrolledDepths = this.scrolledDepths || [];
        
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        
        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !this.scrolledDepths.includes(depth)) {
                this.scrolledDepths.push(depth);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll', {
                        'event_category': 'engagement',
                        'event_label': 'depth',
                        'value': depth
                    });
                }
            }
        });
    },

    // Track time on page
    trackTimeOnPage() {
        this.startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
            if (typeof gtag !== 'undefined' && timeSpent > 0) {
                gtag('event', 'time_on_page', {
                    'event_category': 'engagement',
                    'value': timeSpent
                });
            }
        });
    },

    // Track outbound links
    trackOutboundLinks() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (target && target.href) {
                if (target.href.includes('amazon.com')) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'click', {
                            'event_category': 'outbound',
                            'event_label': 'amazon_affiliate',
                            'transport_type': 'beacon'
                        });
                    }
                } else if (!target.href.startsWith(window.location.origin)) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'click', {
                            'event_category': 'outbound',
                            'event_label': 'external_link',
                            'transport_type': 'beacon'
                        });
                    }
                }
            }
        });
    },

    // Track ad visibility
    trackAdVisibility() {
        const ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach((ad, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'ad_impression', {
                                'event_category': 'monetization',
                                'event_label': `ad_position_${index + 1}`
                            });
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            if (ad) observer.observe(ad);
        });
    },

    // Track form interactions
    trackFormInteractions() {
        const fieldInteractions = {};
        
        document.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('focus', function() {
                const fieldName = this.id || this.name;
                if (!fieldInteractions[fieldName]) {
                    fieldInteractions[fieldName] = true;
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_interaction', {
                            'event_category': 'engagement',
                            'event_label': fieldName
                        });
                    }
                }
            });
        });
    },

    // Track UTM parameters
    trackUTMParameters() {
        const params = new URLSearchParams(window.location.search);
        const utmParams = {};
        
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            if (params.has(param)) {
                utmParams[param] = params.get(param);
            }
        });
        
        if (Object.keys(utmParams).length > 0 && typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                'event_category': 'traffic_source',
                'event_label': JSON.stringify(utmParams)
            });
        }
    },

    // Track device info
    trackDeviceInfo() {
        if (typeof gtag !== 'undefined') {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const deviceType = isMobile ? 'mobile' : 'desktop';
            
            gtag('event', 'device_info', {
                'event_category': 'technical',
                'event_label': deviceType,
                'custom_dimension_1': window.screen.width + 'x' + window.screen.height
            });
        }
    },

    // Track page load performance
    trackPagePerformance() {
        window.addEventListener('load', () => {
            if (typeof gtag !== 'undefined' && window.performance) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                gtag('event', 'timing_complete', {
                    'name': 'load',
                    'value': pageLoadTime,
                    'event_category': 'performance'
                });
            }
        });
    },

    // Track errors
    trackErrors() {
        window.addEventListener('error', (e) => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    'description': e.message,
                    'fatal': false
                });
            }
        });
    },

    // Track tips viewed
    trackTipViewed() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_tip', {
                'event_category': 'engagement',
                'event_label': 'running_tips'
            });
        }
    },

    // Initialize all tracking
    init() {
        // Setup scroll tracking with debounce
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => this.trackScrollDepth(), 100);
        });

        // Initialize all tracking methods
        this.trackTimeOnPage();
        this.trackOutboundLinks();
        this.trackFormInteractions();
        this.trackUTMParameters();
        this.trackDeviceInfo();
        this.trackPagePerformance();
        this.trackErrors();

        // Track ad visibility when page loads
        window.addEventListener('load', () => this.trackAdVisibility());
    }
};