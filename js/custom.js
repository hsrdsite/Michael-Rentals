(function ($) {

  "use strict";

    // PRE LOADER
    $(window).load(function(){
      $('.preloader').fadeOut(1000); // set duration in brackets    
    });


    // THEME TOGGLE
    function initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        const icon = $('#theme-toggle .fa');
        if (theme === 'dark') {
            icon.removeClass('fa-moon-o').addClass('fa-sun-o');
        } else {
            icon.removeClass('fa-sun-o').addClass('fa-moon-o');
        }
    }

    // Initialize theme on page load
    initTheme();

    // Theme toggle click handler
    $('#theme-toggle').on('click', function(e) {
        e.preventDefault();
        toggleTheme();
    });


    // TESTIMONIAL CAROUSEL
    $('.testimonial-carousel').owlCarousel({
        loop: true,
        margin: 20,
        nav: true,
        dots: true,
        autoplay: true,
        autoplayTimeout: 2800,
        autoplayHoverPause: true,
        smartSpeed: 900,
        fluidSpeed: true,
        autoplaySpeed: 900,
        navSpeed: 900,
        dotsSpeed: 900,
        dragEndSpeed: 900,
        touchDrag: true,
        mouseDrag: true,
        pullDrag: true,
        freeDrag: false,
        center: true,
        autoWidth: false,
        responsive: {
            0: {
                items: 1,
                center: false
            },
            576: {
                items: 1,
                center: false
            },
            768: {
                items: 3,
                center: true
            },
            992: {
                items: 3,
                center: true
            },
            1200: {
                items: 3,
                center: true
            }
        }
    });


    // MENU
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });

    $(window).scroll(function() {
      if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
          } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
          }
    });


    // PARALLAX EFFECT
    $.stellar({
      horizontalScrolling: false,
    });


    // SMOOTHSCROLL
    $(function() {
      $('.custom-navbar a').on('click', function(event) {
        var $anchor = $(this);
          $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 49
          }, 1000);
            event.preventDefault();
      });
    });  


    var applicationWizard = {
        started: false,
        currentStep: 0,
        totalSteps: 0
    };

    // MODERN FORM PROGRESS BAR
    function updateFormProgress() {
        if (!applicationWizard.started || applicationWizard.totalSteps === 0) {
            $('#progressBar').css('width', '0%');
            return;
        }

        var progress = ((applicationWizard.currentStep + 1) / applicationWizard.totalSteps) * 100;
        $('#progressBar').css('width', progress + '%');
    }

    // Initialize progress on page load
    updateFormProgress();

    function showApplicationStep(stepIndex) {
        var sections = $('.form-section');

        if (!sections.length) {
            return;
        }

        applicationWizard.currentStep = Math.max(0, Math.min(stepIndex, applicationWizard.totalSteps - 1));
        sections.removeClass('active-step').hide();
        $(sections[applicationWizard.currentStep]).addClass('active-step').show();
        updateFormProgress();

        var applicationSection = document.getElementById('application');
        if (applicationSection) {
            applicationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function validateStep(section) {
        var isValid = true;
        var requiredFields = section.find('[required]').not('input[type="radio"], input[type="checkbox"]');

        section.find('.error-message').removeClass('show').text('');
        section.find('[aria-invalid="true"]').removeAttr('aria-invalid');

        requiredFields.each(function() {
            var field = $(this);
            if (!field.val().trim()) {
                showError(field, 'This field is required');
                isValid = false;
                return;
            }

            validateField(field);
            if (field.attr('aria-invalid') === 'true') {
                isValid = false;
            }
        });

        var radioGroups = {};
        section.find('input[type="radio"][required]').each(function() {
            radioGroups[$(this).attr('name')] = true;
        });

        Object.keys(radioGroups).forEach(function(groupName) {
            var checkedCount = section.find('input[name="' + groupName + '"]:checked').length;
            if (checkedCount === 0) {
                var firstRadio = section.find('input[name="' + groupName + '"]').first();
                showError(firstRadio, 'Please select an option');
                isValid = false;
            }
        });

        return isValid;
    }

    function initApplicationWizard() {
        var startScreen = $('#application-start-screen');
        var startButton = $('#start-application-btn');
        var form = $('#application-form');
        var progress = $('#application-progress');
        var sections = $('.form-section');

        if (!startScreen.length || !startButton.length || !form.length || !sections.length) {
            return;
        }

        applicationWizard.totalSteps = sections.length;
        sections.removeClass('active-step').hide();

        startButton.on('click', function() {
            applicationWizard.started = true;
            startScreen.fadeOut(200, function() {
                $(this).addClass('is-hidden');
            });
            progress.removeClass('is-hidden');
            form.removeClass('is-hidden');
            showApplicationStep(0);
        });

        form.on('click', '.btn-next-step', function() {
            var currentSection = $(sections[applicationWizard.currentStep]);
            if (!validateStep(currentSection)) {
                return;
            }

            showApplicationStep(applicationWizard.currentStep + 1);
        });

        form.on('click', '.btn-prev-step', function() {
            showApplicationStep(applicationWizard.currentStep - 1);
        });
    }


    // FORM SUBMISSION VIA SERVER API
    // Telegram credentials are kept server-side and never exposed in browser code.

    // CONTACT FORM SUBMISSION
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        var formData = new FormData(this);
        var message = 'New Contact Message:\n\n';
        for (var pair of formData.entries()) {
            message += '• ' + formatLabel(pair[0]) + ': ' + pair[1] + '\n';
        }
        
        sendToTelegram(message, {
            onSuccess: function() {
                $('#contact-form')[0].reset();
                $('#contact-success-message').stop(true, true).fadeIn(200).delay(4000).fadeOut(300);
            },
            onFailure: function(error) {
                alert('Unable to send your message: ' + getTelegramErrorMessage(error));
            }
        });
    });

    $('#contact-form').on('input', 'input, textarea', function() {
        $('#contact-success-message').stop(true, true).fadeOut(150);
    });

    // Helper function to format field names
    function formatLabel(fieldName) {
        return fieldName.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    }

    // Helper function to send message to Telegram
    function sendToTelegram(message, options) {
        var settings = options || {};
        var safeMessage = message.length > 3800
            ? message.slice(0, 3797) + '...'
            : message;

        function postTelegram(url) {
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: safeMessage
                })
            }).then(function(response) {
                return response.text().then(function(rawText) {
                    var data = null;

                    if (rawText) {
                        try {
                            data = JSON.parse(rawText);
                        } catch (parseError) {
                            data = null;
                        }
                    }

                    return {
                        ok: response.ok,
                        status: response.status,
                        data: data,
                        url: url
                    };
                });
            });
        }

        postTelegram('/api/telegram')
        .then(function(primaryResult) {
            if (primaryResult.ok && primaryResult.data && primaryResult.data.ok) {
                if (typeof settings.onSuccess === 'function') {
                    settings.onSuccess();
                }
                return;
            }

            if (primaryResult.status === 404 || primaryResult.status === 405) {
                return postTelegram('/api/telegram.js').then(function(fallbackResult) {
                    if (fallbackResult.ok && fallbackResult.data && fallbackResult.data.ok) {
                        if (typeof settings.onSuccess === 'function') {
                            settings.onSuccess();
                        }
                        return;
                    }

                    var fallbackFailure = (fallbackResult.data && typeof fallbackResult.data === 'object')
                        ? fallbackResult.data
                        : {
                            ok: false,
                            description: 'Server returned an invalid response (HTTP ' + fallbackResult.status + ').'
                        };

                    if (typeof settings.onFailure === 'function') {
                        settings.onFailure(fallbackFailure);
                    }
                });
            }

            var primaryFailure = (primaryResult.data && typeof primaryResult.data === 'object')
                ? primaryResult.data
                : {
                    ok: false,
                    description: 'Server returned an invalid response (HTTP ' + primaryResult.status + ').'
                };

            if (typeof settings.onFailure === 'function') {
                settings.onFailure(primaryFailure);
            }
        })
        .catch(function(error) {
            if (typeof settings.onFailure === 'function') {
                settings.onFailure(error);
            }
        });
    }

    function getTelegramErrorMessage(error) {
        if (error && error.description) {
            return error.description;
        }

        if (error && error.message) {
            return error.message;
        }

        return 'Please try again later.';
    }

    // Show thank you message and hide form
    function showThankYouMessage() {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        $('#application-form').fadeOut(300, function() {
            var thankYouMsg = $(this).parent().find('#thank-you-message');
            thankYouMsg.fadeIn(300, function() {
                // Scroll smoothly to the thank you message section
                var applicationSection = document.getElementById('application');
                if (applicationSection) {
                    applicationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Handle "Submit Another Application" button
    $('.btn-new-application').on('click', function() {
        var sections = $('.form-section');

        applicationWizard.started = false;
        applicationWizard.currentStep = 0;

        $('#thank-you-message').fadeOut(300, function() {
            $('#application-form').addClass('is-hidden').show();
            $('#application-progress').addClass('is-hidden');
            $('#application-start-screen').removeClass('is-hidden').hide().fadeIn(300);
            sections.removeClass('active-step').hide();
            updateFormProgress();
        });
    });

    // MOBILE ACCESSIBILITY IMPROVEMENTS
    function initMobileAccessibility() {
        // Add touch feedback for buttons
        $('.section-btn, .btn-submit, .theme-toggle-btn').on('touchstart', function() {
            $(this).addClass('touch-active');
        }).on('touchend touchcancel', function() {
            $(this).removeClass('touch-active');
        });

        // Improve carousel accessibility
        $('.testimonial-carousel').on('changed.owl.carousel', function(event) {
            var current = event.item.index;
            var total = event.item.count;
            $(this).attr('aria-label', 'Customer testimonials carousel - showing testimonial ' + (current + 1) + ' of ' + total);
        });

        // Handle navbar collapse accessibility
        $('.navbar-toggle').on('click', function() {
            var isExpanded = $('.navbar-collapse').hasClass('in');
            $(this).attr('aria-expanded', !isExpanded);
        });

        // Close mobile menu when clicking outside
        $(document).on('click touchstart', function(e) {
            if (!$(e.target).closest('.navbar').length && $('.navbar-collapse').hasClass('in')) {
                $('.navbar-toggle').click();
            }
        });
    }

    // FORM VALIDATION ENHANCEMENT
    function initFormValidation() {
        $('#application-form').on('submit', function(e) {
            e.preventDefault();
            var form = $(this);
            var isValid = true;

            // Clear previous errors
            $('.error-message').removeClass('show').text('');
            form.find('[aria-invalid="true"]').removeAttr('aria-invalid');

            // Validate all required fields
            var requiredFields = form.find('[required]');
            
            requiredFields.each(function() {
                var field = $(this);
                var type = field.attr('type');
                var isRadio = type === 'radio';
                var isCheckbox = type === 'checkbox';
                
                if (isRadio || isCheckbox) {
                    return; // Handle separately below
                }

                if (!field.val().trim()) {
                    showError(field, 'This field is required');
                    isValid = false;
                }
            });

            // Validate radio button groups
            var radioGroups = new Set();
            form.find('input[type="radio"][required]').each(function() {
                radioGroups.add($(this).attr('name'));
            });

            radioGroups.forEach(function(groupName) {
                var checkedCount = form.find('input[name="' + groupName + '"]:checked').length;
                if (checkedCount === 0) {
                    var firstRadio = form.find('input[name="' + groupName + '"]').first();
                    showError(firstRadio, 'Please select an option');
                    isValid = false;
                }
            });

            // Email validation
            var email = $('#email');
            if (email.length && email.val() && !isValidEmail(email.val())) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            }

            // Phone validation
            var phone = $('#phone');
            if (phone.length && phone.val() && !isValidPhone(phone.val())) {
                showError(phone, 'Please enter a valid phone number');
                isValid = false;
            }

            // Date of birth validation (must be 18+)
            var dob = $('#dob');
            if (dob.length && dob.val() && !isOldEnough18(dob.val())) {
                showError(dob, 'You must be at least 18 years old');
                isValid = false;
            }

            // Move-in date validation (must be present or future)
            var moveIn = $('#movein');
            if (moveIn.length && moveIn.val() && !isFutureOrPresentDate(moveIn.val())) {
                showError(moveIn, 'Move-in date must be today or in the future');
                isValid = false;
            }

            if (isValid) {
                var formData = new FormData(this);
                var message = 'New Rental Application:\n\n';

                for (var pair of formData.entries()) {
                    message += '• ' + formatLabel(pair[0]) + ': ' + pair[1] + '\n';
                }

                sendToTelegram(message, {
                    onSuccess: function() {
                        showThankYouMessage();
                        form[0].reset();
                        updateFormProgress();
                    },
                    onFailure: function(error) {
                        console.error('Form submission failed:', error);
                        alert('Unable to send your application: ' + getTelegramErrorMessage(error));
                    }
                });
            } else {
                // Validation errors are shown inline next to fields.
            }
        });

        // Real-time validation - show errors immediately as user interacts
        $('input').on('blur change input', function() {
            validateField($(this));
        });

        // Special validation for date inputs to catch all changes
        $('#dob, #movein').on('change input', function() {
            validateField($(this));
        });

        $('textarea').on('blur change input', function() {
            var field = $(this);
            if (field.prop('required') && !field.val().trim()) {
                showError(field, 'This field is required');
            } else {
                var errorDiv = field.closest('.form-group').find('.error-message');
                errorDiv.removeClass('show').text('');
                field.removeAttr('aria-invalid');
            }
        });

        // Show validation errors as user selects radio buttons
        $('input[type="radio"]').on('change', function() {
            var groupName = $(this).attr('name');
            if (groupName) {
                var group = $('input[name="' + groupName + '"]').first();
                if (group.prop('required') && $('input[name="' + groupName + '"]:checked').length) {
                    group.closest('.form-group').find('.error-message').removeClass('show').text('');
                }
            }
        });

    }

    function showError(field, message) {
        var fieldId = field.attr('id');
        var errorDiv = fieldId ? $('#' + fieldId + '-error') : $();

        if (!errorDiv.length) {
            var formGroup = field.closest('.form-group');
            errorDiv = formGroup.find('.error-message');

            if (!errorDiv.length) {
                errorDiv = $('<div class="error-message" role="alert" aria-live="polite"></div>');
                formGroup.append(errorDiv);
            }
        }

        errorDiv.text(message).addClass('show');
        field.attr('aria-invalid', 'true');
    }

    function validateField(field) {
        var fieldId = field.attr('id');
        var errorDiv = $('#' + fieldId + '-error');
        
        // Always clear error first
        if (errorDiv.length) {
            errorDiv.removeClass('show').text('');
        }
        field.removeAttr('aria-invalid');

        // Skip validation if field is empty and not required
        if (!field.val().trim() && !field.prop('required')) {
            return;
        }

        // Check if field needs validation
        var errorMessage = '';

        if (field.prop('required') && !field.val().trim()) {
            errorMessage = 'This field is required';
        } else if (field.attr('type') === 'email' && field.val() && !isValidEmail(field.val())) {
            errorMessage = 'Please enter a valid email address';
        } else if (fieldId === 'phone' && field.val() && !isValidPhone(field.val())) {
            errorMessage = 'Please enter a valid phone number';
        } else if (fieldId === 'dob' && field.val() && !isOldEnough18(field.val())) {
            errorMessage = 'You must be at least 18 years old';
        } else if (fieldId === 'movein' && field.val()) {
            // Special handling for movein date
            var isValid = isFutureOrPresentDate(field.val());
            if (!isValid) {
                errorMessage = 'Move-in date must be today or in the future';
            }
        }

        // Show error if there is one
        if (errorMessage) {
            if (errorDiv.length) {
                errorDiv.text(errorMessage).addClass('show');
            }
            field.attr('aria-invalid', 'true');
        } else {
            if (errorDiv.length) {
                errorDiv.removeClass('show').text('');
            }
        }
    }

    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        var re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    function isOldEnough18(dateString) {
        var birthDate = new Date(dateString);
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    function isFutureOrPresentDate(dateString) {
        // Parse date string in YYYY-MM-DD format
        var parts = dateString.split('-');
        if (parts.length !== 3) return false;
        
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        var day = parseInt(parts[2], 10);
        
        // Create date in local timezone (not UTC)
        var selectedDate = new Date(year, month, day);
        var today = new Date();
        
        // Set both to start of day for fair comparison
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        return selectedDate >= today;
    }

    // PERFORMANCE OPTIMIZATIONS
    function initPerformanceOptimizations() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            var imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            $('.testimonial-avatar[data-src]').each(function() {
                imageObserver.observe(this);
            });
        }

        // Debounce scroll events
        var scrollTimer;
        $(window).on('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                // Handle scroll-based animations
                $('.animate-on-scroll:not(.animated)').each(function() {
                    var elementTop = $(this).offset().top;
                    var elementBottom = elementTop + $(this).outerHeight();
                    var viewportTop = $(window).scrollTop();
                    var viewportBottom = viewportTop + $(window).height();

                    if (elementBottom > viewportTop && elementTop < viewportBottom) {
                        $(this).addClass('animated');
                    }
                });
            }, 16);
        });
    }

    // Initialize all enhancements
    $(document).ready(function() {
        initApplicationWizard();
        initMobileAccessibility();
        initFormValidation();
        initPerformanceOptimizations();
    });

})(jQuery);
