$(document).ready(function() {
	// HANDLE FORM SUBMIT
	$('form').on('submit', function(e) {
		e.preventDefault();
		var parentDiv = $(e.target).parent();
		var outputWindow = $(parentDiv).siblings('.output-window');
		var textarea = $(e.target).find('textarea');
		queryDB(outputWindow, textarea);

	});

	// HANLDE CTRL + ENTER
	$('textarea').keydown(function (e) {
		if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
			e.preventDefault();
			var inputWindow = $(e.target).parents()[2];
			var outputWindow = $(inputWindow).next();
			var textarea = $(e.target);
			queryDB(outputWindow, textarea);
		}
	});

	// HANDLE SHOW ANSWER
	$('.show-answer').on('click', function(e) {
		e.preventDefault();
		var showAanswer = confirm('Are you sure you wish to see the answer?');
		if (showAanswer) {
			var parent = $(e.target).parent();
			var siblingDiv = $(parent).prev();
			var textarea = $(siblingDiv).find('.sql-input');
			textarea.val(textarea.data('answer'));
			var submitButton = $(e.target).siblings
		}
	});

	// Keep show table opened
	$('.dropdown.keep-open').on({
	    "shown.bs.dropdown": function() { $(this).data('closable', false); },
	    "click":             function() { $(this).data('closable', true);  },
	    "hide.bs.dropdown":  function() { return $(this).data('closable'); }
	});
});

// QUERYING THE DATABASE
var evilCount = 0;

var queryDB = function(outputWindow, textarea) {
	var query = $(textarea).val();
	var answer = $(textarea).data('answer');

	// Prevent SQL inejction!
	var invalid = false;
	var blacklist = ['DROP', 'INSERT', 'UPDATE', 'DELETE', 'ALTER', 'CREATE', 'TRUNCATE'];
	blacklist.forEach(function(word) {
		if (query.toUpperCase().indexOf(word) !== -1 || answer.toUpperCase().indexOf(word) !== -1) {
			invalid = true;
			evilCount++;
			if (evilCount >= 3) {
				console.log('Get the fuck out!');
				window.location = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';
			}
			alert('Wise guy, huh? ' + word + ' is not allowed!');
			return;
		}
	});
	if (invalid) return;

	// Show loading on output screen
	renderLoadingView(outputWindow);

	// AJAX query
	$.get('/run', { query: query, answer: answer })
	.done(function(result) {
		if (result.error) {
			renderErrorView(result.error, outputWindow);
		} else {
			render(result, outputWindow);
		}
	})
	.fail(function() {
		console.log('SERVER ERROR 500');
		renderServerErrorView(outputWindow);
	});
}

// VIEW RENDERING FUNCTIONS

var renderLoadingView = function($outputWindow) {
	var template = JST['loading_screen'];
	var content = template();
	$outputWindow.html(content);
}

var renderErrorView = function(error_message, $outputWindow) {
	var template = JST['output_error'];
	var content = template({
		error: error_message
	});
	$outputWindow.html(content);
}

var renderServerErrorView = function($outputWindow) {
	var template = JST['server_error'];
	var content = template();
	$outputWindow.html(content);
}

var render = function(result, $targetEl) {

	var template = JST['result'];
	var content = template({ result: result });
	$targetEl.html(content);
}

