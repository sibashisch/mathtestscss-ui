let _assignHandlers = function (userType) {

	let sourceModalId = 'menu-modal';

	let topicsLoaded = false;
	let examNamesLoaded = false;
	let topicsForQuesLoaded = false;
	let examNameForQuesLoaded = false;
	let examStudentListLoaded = false;
	let takeExamNamesLoaded = false;


	$('#rotatekey-btn').click(function () {
		$('#rotatekey-message-div').html ('');
		$('#rotatekey-success-div').html ('');
		$('[id^="rotatekey-"]:not("#rotatekey-btn")').show();
		if (confirm("Are You Sure You Want To Rotate The Key Pair? Proceed Only If You Know What You Are Doing.")) {
			_ajaxCall (sourceModalId, '/validate/newkey', 'get', {}, 'json', 'rotatekey-message-div', function () {
				$('#rotatekey-success-div').html ('Key Rotated Successfully.');
			});
		}
	});


	$('#createuser-btn').click(function () {
		$('#createuser-message-div').html ('');
		$('#createuser-success-div').html ('');
		$('[id^="createuser-"]:not("#createuser-btn")').slideToggle();
	});

	$('#createuser-go-btn').click(function() {
		$('#createuser-message-div').html ('');
		$('#createuser-success-div').html ('');

		let userNameToCreate = $('#createuser-username-inp').val().replace(/ /g, '');
		let userPassToCreate = $('#createuser-password-inp').val();
		let userTypeToCreate = $('#createuser-type-sel').val();

		if (userNameToCreate === '') {
			$('#createuser-message-div').html ('User Name Should Not be Blank');
		} else if (userPassToCreate === '') {
			$('#createuser-message-div').html ('Password Should Not be Blank');
		} else if (userType !== '1' && userType !== '2') {
			$('#createuser-message-div').html ('You Are Not Authorized To Create Users');
		} else if (userType === '2' && userTypeToCreate !== '2' && userTypeToCreate !== '3') {
			$('#createuser-message-div').html ('You Are Not Authorized To Create Master Users');
		} else {
			let data = {userNameToCreate: userNameToCreate, userPassTocreate: userPassToCreate, userTypeToCreate: userTypeToCreate};
			_ajaxCall (sourceModalId, '/user/create', 'post', data, 'json', 'createuser-message-div', function () {
				$('#createuser-success-div').html ('User Created Successfully.');
			});
		}
	});


	$('#topic-btn').click(function() {
		$('#topic-message-div').html ('');
		$('#topic-success-div').html ('');
		if ($('[id^="topic-"]:not("#topic-btn")').css('display') === 'none' && !topicsLoaded) {
			_ajaxCall (sourceModalId, '/topic/list', 'get', {}, 'json', 'topic-message-div', function (resp) {
				$("#topic-topicname-inp").typeahead({ source: resp.topics, autoSelect: true, showHintOnFocus: true });
				topicsLoaded = true;
			});	
		}
		$('[id^="topic-"]:not("#topic-btn")').slideToggle();
	});

	$('#topic-go-btn').click(function() {
		$('#topic-message-div').html ('');
		$('#topic-success-div').html ('');
		let topicName = $('#topic-topicname-inp').val().trim();
		if (topicName === '') {
			$('#topic-message-div').html ('Topic Name Should Not be Blank');
		} else {
			let data = {topicName: topicName};
			_ajaxCall (sourceModalId, '/topic/create', 'post', data, 'json', 'topic-message-div', function () {
				$('#topic-success-div').html ('Topic Created Successfully. This New Topic will Appear in Suggestion After Page is Refreshed.');
			});
		}
	});


	$('#createques-btn').click(function() {
		$('#createques-message-div').html ('');
		$('#createques-success-div').html ('');
		if ($('[id^="createques-"]:not("#createques-btn")').css('display') === 'none' && !topicsForQuesLoaded) {
			_ajaxCall (sourceModalId, '/topic/list', 'get', {}, 'json', 'topic-message-div', function (resp) {
				$("#createques-topic-inp").typeahead({ source: resp.topics, autoSelect: true, showHintOnFocus: true });
				topicsForQuesLoaded = true;
			});	
		}
		$('[id^="createques-"]:not("#createques-btn")').slideToggle();
	});

	$('#createques-go-btn').click(function() {
		$('#createques-message-div').html ('');
		$('#createques-success-div').html ('');
		let topic = $('#createques-topic-inp').val();
		let desc = $('#createques-quesdesc-inp').val();
		let link = $('#createques-image-inp').val();
		let optionCount = $('#createques-optioncount-inp').val();
		let answer = $('#createques-answer-inp').val();
		if (topic === '') {
			$('#createques-message-div').html ('Topic Should Not be Blank');
		} else if (link === '') {
			$('#createques-message-div').html ('Question Image URL Should Not be Blank');
		} else if (optionCount === '') {
			$('#createques-message-div').html ('Option Count Should Not be Blank');
		} else if (optionCount.replace(/[0-9]/g, '') !== '' || isNaN(parseInt(optionCount)) || parseInt(optionCount) > 5 || parseInt(optionCount) < 0) {
			$('#createques-message-div').html ('Option Count Should Not a Number Between 0 and 5');
		} else if (parseInt(optionCount) > 0 && answer !== 'A' && answer !== 'B' && answer !== 'C' && answer !== 'D' && answer !== 'E' ) {
			$('#createques-message-div').html ('Answer Should be A/B/C/D/E (in Capital) for MCQs');
		} else if (answer === '') {
			$('#createques-message-div').html ('Answer Should not be Blank');
		} else {
			let data = {topic:topic, optionCount:optionCount, desc:desc, imageUrl:link, answer:answer};
			_ajaxCall (sourceModalId, '/ques/image/create', 'post', data, 'json', 'createques-message-div', function () {
				$('#createques-success-div').html ('Question Created Successfully.');
			});
		}
	});


	$('#createexam-btn').click(function() {
		$('#createexam-message-div').html ('');
		$('#createexam-success-div').html ('');
		if ($('[id^="createexam-"]:not("#createexam-btn")').css('display') === 'none'  && !examNamesLoaded) {
			_ajaxCall (sourceModalId, '/exam/listnames', 'get', {}, 'json', 'createexam-message-div', function (resp) {
				$("#createexam-examname-inp").typeahead({ source: resp.examnames, autoSelect: true, showHintOnFocus: true });
				examNamesLoaded = true;
			});	
		} 
		$('[id^="createexam-"]:not("#createexam-btn")').slideToggle();
	});

	$('#createexam-go-btn').click(function() {
		$('#createexam-message-div').html ('');
		$('#createexam-success-div').html ('');
		let examName = $('#createexam-examname-inp').val().trim();
		let startDate = $('#createexam-date-inp').val();
		let startHour = $('#createexam-hour-inp').val();
		let startMinute = $('#createexam-min-inp').val();
		let instructions = $('#createexam-ins-inp').val();
		let examDuration = $('#createexam-duration-inp').val();
		if (examName === '') {
			$('#createexam-message-div').html ('Exam Name Should Not be Blank');
		} else if (startDate === '') {
			$('#createexam-message-div').html ('Exam Start Date Should Not be Blank');
		} else if (startHour === '') {
			$('#createexam-message-div').html ('Exam Start Hour Should Not be Blank');
		} else if (startMinute === '') {
			$('#createexam-message-div').html ('Exam Start Minute Should Not be Blank');
		} else if (examDuration === '') {
			$('#createexam-message-div').html ('Exam Duration Should Not be Blank');
		} else if (instructions.length > 1000) {
			$('#createexam-message-div').html ('Keep Instructions Within 1000 Characters');
		} else if (examDuration.replace(/[0-9]/g, '') !== '') {
			$('#createexam-message-div').html ('Exam Duration Should be Numeric');
		} else {
			let startDateTimeStr = startDate + ' ' + startHour + ':' + startMinute + ':00';
			let data = {name: examName, instructions: instructions, startDateTime: startDateTimeStr, duration: examDuration};
			_ajaxCall (sourceModalId, '/exam/create', 'post', data, 'json', 'createexam-message-div', function () {
				$('#createexam-success-div').html ('Exam Created Successfully. This New Exam will Appear in Suggestion After Page is Refreshed.');
			});
		}
	});


	$('#examques-btn').click(function() {
		$('#examques-message-div').html ('');
		$('#examques-success-div').html ('');
		if ($('[id^="examques-"]:not("#examques-btn")').css('display') === 'none'  && !examNameForQuesLoaded) {
			_ajaxCall (sourceModalId, '/exam/listnames', 'get', {}, 'json', 'examques-message-div', function (resp) {
				$("#examques-examname-inp").typeahead({ source: resp.examnames, autoSelect: true, showHintOnFocus: true });
				examNameForQuesLoaded = true;
			});	
		}
		$('[id^="examques-"]:not("#examques-btn")').slideToggle();
	});

	$('#examques-go-btn').click (function () {
		$('#examques-message-div').html ('');
		$('#examques-success-div').html ('');
		let examName = $('#examques-examname-inp').val().trim();
		let folderName = $('#examques-folder-inp').val();
		if (examName === '') {
			$('#examques-message-div').html ('Exam Name Should Not be Blank');
		} else if (folderName === '') {
			$('#examques-message-div').html ('Drive Folder Id Should Not be Blank');
		} else {
			let data = {examName: examName, folderId: folderName};
			_ajaxCall (sourceModalId, '/exam/ques/map/gdrive', 'post', data, 'json', 'examques-message-div', function (resp) {
				$('#examques-success-div').html (resp.questioncount + ' Questions Discovered, ' + resp.addedcount + ' Questions Added.');
			});
		}
	});


	$('#examstudent-btn').click (function() {
		$('#examstudent-message-div').html ('');
		$('#examstudent-success-div').html ('');
		if ($('[id^="examstudent-"]:not("#examstudent-btn")').css('display') === 'none'  && !examStudentListLoaded) {
			_ajaxCall (sourceModalId, '/exam/listnames', 'get', {}, 'json', 'examstudent-message-div', function (resp) {
				$("#examstudent-examname-inp").typeahead({ source: resp.examnames, autoSelect: true, showHintOnFocus: true });
				examStudentListLoaded = true;
			});	
		} 
		$('[id^="examstudent-"]:not("#examstudent-btn")').slideToggle();
	});

	$('#examstudent-go-btn').click(function() {
		$('#examstudent-message-div').html ('');
		$('#examstudent-success-div').html ('');
		let examName = $('#examstudent-examname-inp').val().trim();
		if (examName === '') {
			$('#examstudent-message-div').html ('Exam Name Should Not be Blank');
		} else {
			_ajaxCall (sourceModalId, '/exam/user/listall', 'post', {examName: examName}, 'json', 'examstudent-message-div', function (resp) {
				_saveUserData(PARAM_USER_LIST, JSON.stringify(resp.users));
				_saveUserData(PARAM_ADDED_USERS, JSON.stringify(resp.added));
				_saveUserData(PARAM_EXAM_NAME, examName);
				window.location.href = EXAM_USER_PAGE;
			});
		}
	});


	$('#test-btn').click (function() {
		$('#test-message-div').html ('');
		$('#test-success-div').html ('');
		if ($('[id^="test-"]:not("#test-btn")').css('display') === 'none'  && !takeExamNamesLoaded) {
			_ajaxCall (sourceModalId, '/exam/get/list', 'get', {}, 'json', 'test-message-div', function (resp) {
				let examNames = [];
				resp.examdata.forEach (exam => {
					examNames.push(exam.id + ": " + exam.name + " (from " + exam.owner + ")");
				});
				$("#test-examname-inp").typeahead({ source: examNames, autoSelect: true, showHintOnFocus: true });
				takeExamNamesLoaded = true;
			});	
		} 
		$('[id^="test-"]:not("#test-btn")').slideToggle();
	});

	$('#test-go-btn').click(function() {
		$('#test-message-div').html ('');
		$('#test-success-div').html ('');
		let examName = $('#test-examname-inp').val().trim();
		if (examName === '') {
			$('#test-message-div').html ('Exam Name Should Not be Blank');
		} else {
			window.location.href = EXAM_PAGE + '?examId=' + examName.split(':')[0];
		}
	});


	$('#logout-btn').click(function() {
		_logout ('menu-modal', 'message-div');
	});
}