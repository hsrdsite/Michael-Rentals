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


    // MODERN FORM PROGRESS BAR
    function updateFormProgress() {
        var form = $('#application-form')[0];
        if (!form) return;
        
        var inputs = form.querySelectorAll('input, textarea');
        var filledCount = 0;
        var requiredCount = 0;
        
        inputs.forEach(function(input) {
            if (input.hasAttribute('required')) {
                requiredCount++;
                if (input.value.trim() !== '') {
                    filledCount++;
                }
            }
        });
        
        var progress = requiredCount > 0 ? (filledCount / requiredCount) * 100 : 0;
        $('#progressBar').css('width', progress + '%');
    }

    // Update progress on input change
    $('#application-form').on('input change', 'input, textarea', function() {
        updateFormProgress();
    });

    // Initialize progress on page load
    updateFormProgress();


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

        fetch('/api/telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: safeMessage
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                if (typeof settings.onSuccess === 'function') {
                    settings.onSuccess();
                }
            } else {
                console.error('Telegram API error:', data);
                if (typeof settings.onFailure === 'function') {
                    settings.onFailure(data);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
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

    function preserveScrollPosition(scrollTop) {
        // Position preserved naturally by DOM structure
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
        $('#thank-you-message').fadeOut(300, function() {
            $('#application-form').fadeIn(300);
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
                    console.log('Field failed validation:', field.attr('id') || field.attr('name'));
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
                console.log('Radio group "' + groupName + '":', checkedCount, 'selected');
                if (checkedCount === 0) {
                    var firstRadio = form.find('input[name="' + groupName + '"]').first();
                    showError(firstRadio, 'Please select an option');
                    isValid = false;
                }
            });

            // Email validation
            var email = $('#email');
            if (email.length && email.val() && !isValidEmail(email.val())) {
                console.log('Email validation failed:', email.val());
                showError(email, 'Please enter a valid email address');
                isValid = false;
            }

            // Phone validation
            var phone = $('#phone');
            if (phone.length && phone.val() && !isValidPhone(phone.val())) {
                console.log('Phone validation failed:', phone.val());
                showError(phone, 'Please enter a valid phone number');
                isValid = false;
            }

            // Date of birth validation (must be 18+)
            var dob = $('#dob');
            if (dob.length && dob.val() && !isOldEnough18(dob.val())) {
                console.log('Age validation failed:', dob.val());
                showError(dob, 'You must be at least 18 years old');
                isValid = false;
            }

            // Move-in date validation (must be present or future)
            var moveIn = $('#movein');
            if (moveIn.length && moveIn.val() && !isFutureOrPresentDate(moveIn.val())) {
                console.log('Move-in date validation failed:', moveIn.val());
                showError(moveIn, 'Move-in date must be today or in the future');
                isValid = false;
            }

            console.log('Form validation result:', isValid);

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
                console.warn('Form validation failed - check console for details');
            }
        });

        // Real-time validation - show errors immediately as user interacts
        $('input').on('blur change input', function() {
            validateField($(this));
        });

        // Special validation for date inputs to catch all changes
        $('#dob, #movein').on('change input', function() {
            console.log('Date field changed:', $(this).attr('id'), $(this).val());
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

        // Direct validation for move-in date field
        $('#movein').on('change input', function() {
            var moveInError = $('#movein-error');
            var value = $(this).val();
            
            if (value && isFutureOrPresentDate(value)) {
                // Valid date - hide error
                moveInError.removeClass('show').text('');
                $(this).removeAttr('aria-invalid');
            } else if (value && !isFutureOrPresentDate(value)) {
                // Invalid date - show error
                moveInError.addClass('show').text('Move-in date must be today or in the future');
                $(this).attr('aria-invalid', 'true');
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
        
        console.log('validateField called for:', fieldId, 'value:', field.val());
        
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
            console.log('Move-in date check - value:', field.val(), 'isValid:', isValid);
            if (!isValid) {
                errorMessage = 'Move-in date must be today or in the future';
            }
        }

        // Show error if there is one
        if (errorMessage) {
            console.log('Showing error for', fieldId, ':', errorMessage);
            if (errorDiv.length) {
                errorDiv.text(errorMessage).addClass('show');
            }
            field.attr('aria-invalid', 'true');
        } else {
            console.log('No error for', fieldId);
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

    function showSuccess() {
        $('.form-section').hide();
        $('.thank-you-message').show();
        $('#progressBar').css('width', '100%');
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
        initMobileAccessibility();
        initFormValidation();
        initPerformanceOptimizations();
    });

})(jQuery);
