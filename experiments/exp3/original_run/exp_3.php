<?php

	// Create a database connection


	$connection = mysql_connect("mysql-server.ucl.ac.uk","ucjtw3g","1Ammooi9");


	
	if (!$connection)

	{

		die("Database connection failed: " . mysql_error());

	}

	// Select a database to use
	$db_select = mysql_select_db("ucjtw3g", $connection);

	
	if (!$db_select)

	{

		die("Database connection failed: " . mysql_error());

	}

	

	$ip = $_SERVER['REMOTE_ADDR'];
	$date = date('Y-m-d');
	
	// Get values passed from Flash
	$group_id = $_REQUEST['group_id'];
	$data = $_REQUEST['main'];
	$extra = $_REQUEST['extra'];
	$feedback = $_REQUEST['feedback'];
	$participant_id = $_REQUEST['participantID'];

	//$query = "INSERT INTO neil_acl3 (ip, date, groupID, data, extra, feedback) VALUES ('{$ip}', '{$date}', '{$group_id}', '{$data}', '{$extra}', '{$feedback}')";
	//mysql_query($query, $connection);

	// Add to subjects list
	$query = "UPDATE neil_acl3 SET ip = '{$ip}', date = '{$date}', groupID = '{$group_id}', data = '{$data}', extra = '{$extra}', feedback = '{$feedback}'  WHERE id = $participant_id";
	mysql_query($query, $connection);
	
	// Close connection
	mysql_close($connection);

?>


