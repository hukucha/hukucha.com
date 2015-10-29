// Calculate viewport width and fix viewport to 300 pixels for phones
function targetWidth(gal) {
	if ($(window).width() < 768) {
		return 315;
	}
	return gal.width() + parseInt(gal.find('li').css('margin-right'));
}

$(document).ready(function() {

	// Prevent double click on iOS devices
	var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);

	$.fn.nodoubletapzoom = function() {
		if (IS_IOS) $(this).bind('touchstart', function preventZoom(e) {
			var t2 = e.timeStamp,
				t1 = $(this).data('lastTouch') || t2,
				dt = t2 - t1,
				fingers = e.originalEvent.touches.length;
			$(this).data('lastTouch', t2);
			if (!dt || dt > 500 || fingers > 1) return; // not double-tap
			e.preventDefault(); // double tap - prevent the zoom
			// also synthesize click events we just swallowed up
			$(this).trigger('click').trigger('click');
		});
	};



	// Fix navigation bar at the top when scrolling
	var fixedNav = $('nav'),
		fixedNavTopPosition = fixedNav.offset().top;

	$(window).on('scroll', function() {

		if ($(window).scrollTop() > fixedNavTopPosition) {
			fixedNav.addClass('fixed');
		} else {
			fixedNav.removeClass('fixed');
		}
	});



	// Activate the navigation menu according to the position
	var sections = $('section'),
		nav = $('nav'),
		nav_height = nav.outerHeight();

	$(window).on('scroll', function() {
		var cur_pos = $(this).scrollTop();

		sections.each(function() {
			var top = $(this).offset().top - nav_height,
				bottom = top + $(this).outerHeight();

			if (cur_pos >= top && cur_pos <= bottom) {
				nav.find('li a').removeClass('active');

				$(this).addClass('active');
				nav.find('li a[href="#' + $(this).attr('id') + '"]').addClass('active');
			}
		});
	});



	// Scroll smoothly when navigating internally
	$(function() {
		$('a[href*=#]:not([href=#])').click(function() {
			if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
				if (target.length) {
					$('html,body').animate({
						scrollTop: target.offset().top - 60
					}, 1000);
					return false;
				}
			}
		});
	});



	// Display or hide the scroll to top icon according to vertical positioning
	$(document).scroll(function() {
		var y = $(this).scrollTop();
		if (y > 600) {
			$('#to_top').fadeIn();
		} else {
			$('#to_top').fadeOut();
		}
	});



	// Introduction link
	$('a[data-gallery][data-company]').click(function() {
		var link = $(this);
		setTimeout(function() {
			$(link.attr('data-gallery')).find('li').eq(link.attr('data-company')).find('a').click();
		}, 1000);
	});



	// Portfolio gallery
	$('.gallery_nav').each(function() {

		// Commons
		var nav = $(this);
		var gal = $(nav.attr('data-gallery'));
		var ul  = gal.find('> ul');
		var prv = nav.find('a.prev');
		var nxt = nav.find('a.next');
		var min = nav.find('a.minimize');
		if ($(window).width() < 768) {
			var divider = 300;
		} else {
			var divider = 190;
		};



		// Refresh prev/next buttons, pages & active items
		nav.bind('refresh', function() {

			// Width
			var wid = targetWidth(gal);

			// Get number of items & current page
			var liCount = ul.find('> li').length;
			var page = Math.round(parseInt(ul.css('margin-left')) / -wid);

			// Calculate number of pages according to gallery state (open)
			var pages = gal.hasClass('open') ? liCount - 1 : Math.ceil(liCount * divider / wid) - 1;

			// Set page/pages
			nav.data('pages', pages);
			nav.data('page', page);

			// Enable/disable prev/next according to page/pages
			if (page == 0) prv.addClass('inactive');
			else prv.removeClass('inactive');
			if (page == pages) nxt.addClass('inactive');
			else nxt.removeClass('inactive');

			// Set active item & minimized button
			ul.find('> li.active').removeClass('active');
			if (gal.hasClass('open')) {
				ul.find('> li').eq(page).addClass('active');
				min.removeClass('collapsed');
			} else {
				min.addClass('collapsed');
			}
		}).trigger('refresh');

		// Previous page button
		prv.bind('click', function() {
			var button = $(this);
			if (!button.hasClass('inactive')) {
				var wid = targetWidth(gal);
				ul.css('margin-left', (parseInt(nav.data('page')) - 1) * -wid);
				clearTimeout(button.data('slide-timeout'));
				button.data('slide-timeout', setTimeout(function() {
					nav.trigger('refresh');
				}, 1000));
			}
			return false;
		});

		// Next page button
		nxt.bind('click', function() {
			var button = $(this);
			if (!button.hasClass('inactive')) {
				var wid = targetWidth(gal);
				ul.css('margin-left', (parseInt(nav.data('page')) + 1) * -wid);
				clearTimeout(button.data('slide-timeout'));
				button.data('slide-timeout', setTimeout(function() {
					nav.trigger('refresh');
				}, 1000));
			}
			return false;
		});

		// Minimize button
		min.bind('click', function() {
			gal.find('li.active a').click();
			return false;
		});

		// Item click
		ul.find('> li > a').click(function() {
			var wid = targetWidth(gal);
			var link = $(this);
			var li = link.parent('li');
			if (gal.hasClass('open')) {
				var idx = li.index();
				ul.css('margin-left', Math.floor(idx / 5) * -wid);
				gal.removeClass('open');
				clearTimeout(link.data('slide-timeout'));
				link.data('slide-timeout', setTimeout(function() {
					nav.trigger('refresh');
				}, 1000));
			} else {
				var idx = li.index();
				ul.css('margin-left', idx * -wid);
				gal.addClass('open');
				clearTimeout(link.data('slide-timeout'));
				link.data('slide-timeout', setTimeout(function() {
					nav.trigger('refresh');
				}, 1000));
			}
			return false;
		});
	});

});