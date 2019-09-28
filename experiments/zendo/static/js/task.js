var trial = 0;
var trials = _.shuffle([0,1,2,3,4,5,6,7,8,9]);
var colours = []; //To be populated from stim.json
var sizes = []; //To be populated from stim.json
var responses = []; //Participants responses stored here
var start_time = new Date();
var start_task_time;
var end_time;
var this_trial_data;
var this_free_response_data;
// MAIN TRIAL BEHAVIOUR
//////////////////////////
function goto_task()
{
	$('#instructions').hide();
	$('#debrief').hide();
	$('#main_task').show();
	$('#completed').hide();
	start_task_time = new Date();
	advance_trial();
}

function goto_debrief()
{
	$('#instructions').hide();
	$('#main_task').hide();
	$('#debrief').show();
	$('#completed').hide();
}

function goto_complete() {
	$('#instructions').hide();
	$('#main_task').hide();
	$('#debrief').hide();
	$('#completed').show();

	$('#completion_code_tb').text(code);
}

function save_data() {
	var iframe = document.getElementById("game_frame");
	if (iframe)
	{
		var iframeContent = (iframe.contentWindow || iframe.contentDocument);
		this_trial_data = iframeContent.trialdata;
		this_free_resp_data = $('#free_response_tb').val();
	} else {
		alert('missing iframe');
	}


	advance_trial();
}

function advance_trial() {
	trial++;
	//console.log("executed advance trial", trial);

	if (trial<trials.length)
	{
		// $('#drawing').attr({fill: colours[trials[trial]],
		// 	r:sizes[trials[trial]]});
		$('#trial_counter').text('Question ' + trial + ' of 10');

		if (trial>1)
		{
			var iframe = document.getElementById("game_frame");
			iframe.src += ''; //Refresh iframe
		}
		run_trial();
	} else if (trial>trials.length) {
		goto_debrief();
	}
}

function comp_checker() {

	//Pull the selected values
	var q = [$('#comp_q1').val(),$('#comp_q2').val(),
				$('#comp_q3').val(),$('#comp_q4').val(),
				$('#comp_q5').val()];

   // Add the correct answers here
   answers = ["true","false","true","false","false"];

   if(q[0] == answers[0] 
      && q[1] == answers[1] 
      && q[2] == answers[2] 
      &&  q[3] == answers[3] 
      &&  q[4] == answers[4]){
   		// Allow the start
        alert('You got everything correct! Press "Start" to begin the experiment.');
        $('#done_comp').show();
        $('#comp_check_btn').hide();
    } else {
    	// Throw them back to the start of the instructions
    	// Remove their answers and have them go through again
		alert('You answered at least one question incorrectly! Please try again.');

    	$('#comp_q1').prop('selectedIndex', 0);
    	$('#comp_q2').prop('selectedIndex', 0);
    	$('#comp_q3').prop('selectedIndex', 0);
    	$('#comp_q4').prop('selectedIndex', 0);
    	$('#comp_q5').prop('selectedIndex', 0);
    	$('#done_comp').hide();
    	$('#comp_check_btn').show();
    	$('#ins1').show();
		$('#comprehension').hide();
    };
}

// Checks whether all questions were answered
function comp_change_checker() {
	var q = [$('#comp_q1').val(),$('#comp_q2').val(),
				$('#comp_q3').val(),$('#comp_q4').val(),
				$('#comp_q5').val()];

	//Make sure start button is disabled because the answers haven't been checked
	$('#done_comp').hide();

 	//Only release the check button if there is a response on all questions
	if (q[0] === 'noresp' || q[1] === 'noresp' || q[2] === 'noresp' || q[3] === 'noresp' || q[4] === 'noresp')
	{
		$('#comp_check_btn').hide();
	} else {
		$('#comp_check_btn').show();
	}
};

function response_change_checker() {
	var text_resp = $('#free_response_tb').val();

	//Make sure start button is disabled because the answers haven't been checked
	$('#task_btn').prop('disabled', true);

 	//Only release the check button if there is a response on all questions
	if (text_resp.length>3)
	{
		$('#task_btn').prop('disabled', false);
	} else {
		$('#task_btn').prop('disabled', true);
	}
};



////////////////
// INITIAL VIEW:
////////////////
function start()
{
	// Initially block both the check button and the start button
	$('#done_comp').hide();//prop('disabled', true);
	$('#comp_check_btn').hide();//prop('disabled', true);

	$('#instructions').show();
	$('#main_task').hide();
	$('#debrief').hide();

	// DECORATE THE BUTTONS ETC
	$('#task_btn').click(save_data);
	$('#free_response_tb').change(function() {
		response_change_checker();
	});
	// INSTRUCTION SLIDE BEHAVIOUR
	// Step through slides
	$('#ins1btn').click(function () {
		$('#ins1').hide();
		$('#ins2').show();
	});

	$('#ins2btn').click(function () {
		$('#ins2').hide();
		$('#ins3').show();
	});

	$('#ins3btn').click(function () {
		$('#ins3').hide();
		$('#ins4').show();
	});

	$('#ins4btn').click(function () {
		$('#ins4').hide();
		$('#ins5').show();
	});

	$('#ins5btn').click(function () {
		$('#ins5').hide();
		$('#comprehension').show();
	});

	// Start the main task function (just causes a refresh)
	$('#done_comp').click(function () {
		console.log('STARTING TASK');
		goto_task();
	});

	// Listen for actions on radio buttons for when all questions answered
	$('.comp_questions').change(function() {
		comp_change_checker();
	});

	// Answer checker function
	$('#comp_check_btn').click(function () { 
		comp_checker();
	});

	//Loaded from rules.js prior to running this script
 	rules = [Rule1, Rule2, Rule3, Rule4, Rule5, Rule6, Rule7, Rule8, Rule9, Rule10];
    // rule_names = ['Zeta' ,'Phi' ,'Upsilon' ,'Iota' ,'Kappa' ,'Omega' ,'Mu' ,'Nu' ,'Xi', 'Psi'];
    rule_names = ['Geosyog' ,'Plasill' ,'Bioyino' ,'Waratel' ,'Sepatoo' ,'Moderock' ,'Replitz' ,'Pegmode' ,'Mizule', 'Lazap'];
    $.ajax({
        dataType: "json",
        url: "./static/json/zendo_cases.json",
        async: false,
        success: function(data) {

            console.log("Got trial data");
            zendo_cases = data;
            // start2();
        }
    });
}



function run_trial()
{
   
    // rand_trial = Math.floor(Math.random()*9);
    rand_counter = Math.floor(Math.random()*11);

    prompt_phase1 = '<p id="prompt2" align="left">&#8226 Here are some objects.<br>' + 
                '&#8226 Click "<b>Test</b>" to see if they emit <b>'  + 
                    rule_names[trials[trial]] + '</b> waves.</p>';

    prompt_phase2 = '<p id="prompt2" align="left">&#8226 Now choose your own arrangement.  Click on the squares at the bottom to add objects to the scene.<br>' +
        '&#8226 Once added, <b>left hold click</b> on objects to move them, use "<b>Z</b>"/"<b>X</b>" to rotate, and <b>right click</b> to remove.<br>' +
        '&#8226 When you have the arrangement you want, click "<b>Test</b>" to see if it emits <b>'  + 
            rule_names[trials[trial]] + '</b> waves.<br>' +
        '&#8226 Outcomes of your previous tests are shown at the top.  You get <b>8</b> tests in total.<br>' +
        '&#8226 A yellow star means your arrangement did follow the rule,  an empty star means it did not.</p>';

    prompt_phase3 = '<p id="prompt2" align="left">&#8226 Here are 8 new arrangements<br>' +
    '&#8226 Select which ones you think emit <b>'  + 
            rule_names[trials[trial]] + '</b> waves<br>' +
    '&#8226 You must select at least 1 and less than all 8.<b>';

    //Prep data
    examples = zendo_cases[trials[trial]].t.slice(0,1);
    test_cases = zendo_cases[trials[trial]].t.slice(1).concat(zendo_cases[trials[trial]].f.slice(1));

    var iframe = document.getElementById("game_frame");

    if (iframe) {
    	// iframe.src = iframe.src;
    	//$('#iframe').attr('src', $('#iframe').attr('src'));
    	// iframe.contentDocument.location.reload(true);
    	//iframe.src += '';
        var iframeContent = (iframe.contentWindow || iframe.contentDocument);
        console.log('Starting iframe');
        iframeContent.Start(rules[trials[trial]], examples, test_cases, rule_names[trials[trial]], rand_counter);
    }

  
    $('#free_response_prompt').hide();
    $('#free_response_tb').hide();
    $('#task_btn').hide();
    $('#task_btn').prop("disabled", true);
}

function description_phase()
{
	$('#free_response_prompt').show();
    $('#free_response_tb').show();
    $('#task_btn').show();
    // document.getElementById('game_frame').src = document.getElementById('game_frame').src;
    // StartIframe();   
}

//END