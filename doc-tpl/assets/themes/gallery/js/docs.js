!
function($) {

	$(function() {
		var h2_list = $('h2');
		var nav_list = $('.bs-docs-sidenav');
		for(var i = 0, len = h2_list.length; i < len; i++){
			var cur_list = h2_list[i];
			var list_id = cur_list.id ? cur_list.id : cur_list.id = 'area' + i;
			nav_list.append('<li><a href = "#' +
				list_id + '">' +
				cur_list.innerHTML + '</a></li>');
		}

		var nav_width = $('.bs-docs-sidebar .bs-docs-sidenav').width();
		var h1_width = $('.bs-docs-sidebar h1').width();
		var toggle_left = $('.bs-docs-sidebar .nav-toggle').css('margin-left');

		$('.bs-docs-sidebar .J_Toggle').click(function() {
			$('.bs-docs-sidebar .bs-docs-sidenav').animate({
				'width': '0',
				'opacity': '0'
			}, 600);

			$('.bs-docs-sidebar h1').animate({
				'width': '0',
				'opacity': '0'
			}, 600);

			$('.bs-docs-sidebar').animate({
				'width': '50px'
			}, 600);

			$('.bs-docs-content').animate({
				'width': '90%'
			}, 600);

			$('.bs-docs-sidebar .nav-toggle').animate({
				'margin-left': '0',
				'opacity': '0'
			}, 575, function() {
				$('.bs-docs-sidebar-mini').animate({
					'width': '26px'
				}, 200);
			});
		});

		$('.bs-docs-sidebar-mini .J_Toggle').click(function() {
			$('.bs-docs-sidebar-mini').animate({
				'width': '0'
			}, 200, function(){
				// $('.bs-docs-sidebar .bs-docs-sidenav').show();
				$('.bs-docs-sidebar .bs-docs-sidenav').animate({
					'width': nav_width,
					'opacity': '1'
				}, 600);

				$('.bs-docs-sidebar h1').animate({
					'width': h1_width,
					'opacity': '1'
				}, 600);

				$('.bs-docs-sidebar .nav-toggle').animate({
					'margin-left': toggle_left,
					'opacity': '1'
				}, 600);

				$('.bs-docs-sidebar').animate({
					'width': '23.404255319148934%'
				}, 600);

				$('.bs-docs-content').animate({
					'width': '74.46808510638297%'
				}, 600);
			});
		});

	});

}(window.jQuery);