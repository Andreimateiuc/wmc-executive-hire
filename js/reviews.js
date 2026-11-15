/* WMC Executive Private Hire — homepage reviews
 *
 * Approved testimonials are listed in WMC_REVIEWS below.
 * Leave the array empty until a review has been checked and approved.
 * When the array is empty, the "What our clients say" block stays hidden.
 *
 * Example entry (do not invent reviews):
 * {
 *   name: "Initial and surname only",
 *   journey: "Northampton to Heathrow",
 *   rating: 5,
 *   quote: "The approved review text."
 * }
 */
window.WMC_REVIEWS = [
    {
        name: "Robert",
        rating: 5,
        quote: "Excellent service from start to finish! The driver was professional, friendly and punctual. The car was clean and comfortable. Highly recommended for anyone looking for reliable private hire services!"
    },
    {
        name: "Alex",
        journey: "Airport",
        rating: 5,
        quote: "Very professional service! The car was spotless, beautifully maintained and even had complimentary bottled water. Excellent cleanliness, comfort and attention to detail. Highly recommended!"
    }
];

(function () {
    var WA_BASE = "https://wa.me/447459417049";

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function starIcons(rating) {
        var html = "";
        var i;
        for (i = 1; i <= 5; i += 1) {
            html += '<span class="review-star' + (i <= rating ? " is-on" : "") + '" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" focusable="false"><path d="M12 2.5l2.8 6.1 6.7.7-5 4.6 1.4 6.6L12 17.8 6.1 20.5 7.5 13.9l-5-4.6 6.7-.7L12 2.5z"/></svg>' +
                "</span>";
        }
        return html;
    }

    function renderTestimonials() {
        var section = document.getElementById("clientReviews");
        var list = document.getElementById("clientReviewsList");
        if (!section || !list) {
            return;
        }

        var reviews = Array.isArray(window.WMC_REVIEWS) ? window.WMC_REVIEWS : [];
        if (!reviews.length) {
            section.hidden = true;
            list.innerHTML = "";
            return;
        }

        list.innerHTML = reviews.map(function (review) {
            var name = escapeHtml((review && review.name) || "Client");
            var journey = review && review.journey ? escapeHtml(review.journey) : "";
            var quote = escapeHtml((review && review.quote) || "");
            var rating = parseInt(review && review.rating, 10);
            if (!(rating >= 1 && rating <= 5)) {
                rating = 0;
            }
            var ratingLabel = rating ? rating + " out of 5" : "";
            return '<article class="client-review-card">' +
                (rating ? '<div class="client-review-stars" aria-label="' + ratingLabel + '">' + starIcons(rating) + "</div>" : "") +
                "<blockquote><p>" + quote + "</p></blockquote>" +
                '<p class="client-review-meta"><span class="client-review-name">' + name + "</span>" +
                (journey ? '<span class="client-review-journey">' + journey + "</span>" : "") +
                "</p></article>";
        }).join("");

        section.hidden = false;
    }

    function setFieldError(id, message) {
        var el = document.getElementById(id);
        if (el) {
            el.textContent = message || "";
        }
    }

    function paintStars(buttons, preview, selected) {
        var shown = preview || selected;
        buttons.forEach(function (btn) {
            var value = parseInt(btn.getAttribute("data-rating"), 10);
            btn.classList.toggle("is-on", value <= shown && shown > 0);
            btn.setAttribute("aria-checked", value === selected && selected > 0 ? "true" : "false");
        });
    }

    function initReviewForm() {
        var form = document.getElementById("reviewForm");
        if (!form) {
            return;
        }

        var ratingInput = document.getElementById("reviewRating");
        var ratingGroup = document.getElementById("reviewStarRating");
        var buttons = ratingGroup ? Array.prototype.slice.call(ratingGroup.querySelectorAll("[data-rating]")) : [];
        var selected = 0;

        function currentRating() {
            return selected;
        }

        paintStars(buttons, 0, selected);

        if (ratingGroup) {
            ratingGroup.addEventListener("mouseleave", function () {
                paintStars(buttons, 0, selected);
            });
        }

        buttons.forEach(function (btn) {
            btn.addEventListener("mouseenter", function () {
                paintStars(buttons, parseInt(btn.getAttribute("data-rating"), 10), selected);
            });
            btn.addEventListener("click", function () {
                selected = parseInt(btn.getAttribute("data-rating"), 10);
                if (ratingInput) {
                    ratingInput.value = String(selected);
                }
                setFieldError("reviewRatingError", "");
                paintStars(buttons, 0, selected);
            });
            btn.addEventListener("keydown", function (event) {
                var next = selected;
                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                    next = Math.min(5, (selected || 0) + 1);
                    event.preventDefault();
                } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                    next = Math.max(1, (selected || 1) - 1);
                    event.preventDefault();
                } else if (event.key === "Home") {
                    next = 1;
                    event.preventDefault();
                } else if (event.key === "End") {
                    next = 5;
                    event.preventDefault();
                } else {
                    return;
                }
                selected = next;
                if (ratingInput) {
                    ratingInput.value = String(selected);
                }
                setFieldError("reviewRatingError", "");
                paintStars(buttons, 0, selected);
                var focusBtn = ratingGroup.querySelector('[data-rating="' + selected + '"]');
                if (focusBtn) {
                    focusBtn.focus();
                }
            });
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var nameEl = document.getElementById("reviewName");
            var journeyEl = document.getElementById("reviewJourney");
            var messageEl = document.getElementById("reviewMessage");
            var name = nameEl ? nameEl.value.trim() : "";
            var journey = journeyEl ? journeyEl.value.trim() : "";
            var message = messageEl ? messageEl.value.trim() : "";
            var rating = currentRating();
            var valid = true;

            setFieldError("reviewNameError", "");
            setFieldError("reviewJourneyError", "");
            setFieldError("reviewRatingError", "");
            setFieldError("reviewMessageError", "");

            if (name.length < 2) {
                setFieldError("reviewNameError", "Please enter your name");
                valid = false;
            }
            if (!(rating >= 1 && rating <= 5)) {
                setFieldError("reviewRatingError", "Please select a rating from 1 to 5 stars");
                valid = false;
            }
            if (message.length < 10) {
                setFieldError("reviewMessageError", "Please write a short review (at least 10 characters)");
                valid = false;
            }

            if (!valid) {
                var firstError = form.querySelector(".error-message:not(:empty)");
                if (firstError && firstError.parentElement) {
                    firstError.parentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                return;
            }

            var lines = [
                "New WMC review",
                "Name: " + name,
                "Rating: " + rating + "/5"
            ];
            if (journey) {
                lines.push("Journey: " + journey);
            }
            lines.push("Review: " + message);

            var whatsappUrl = WA_BASE + "?text=" + encodeURIComponent(lines.join("\n"));
            var submitButton = form.querySelector('button[type="submit"]');
            var originalText = submitButton ? submitButton.textContent : "";
            if (submitButton) {
                submitButton.textContent = "Opening WhatsApp...";
                submitButton.disabled = true;
            }

            var whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            if (!whatsappWindow) {
                window.location.href = whatsappUrl;
            }

            if (submitButton) {
                setTimeout(function () {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 1200);
            }
        });
    }

    function init() {
        renderTestimonials();
        initReviewForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
