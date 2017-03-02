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
	
	
	// Get values passed from Flash
	$ip = $_SERVER['REMOTE_ADDR'];
	$date = date('Y-m-d');
	$data = $_POST['answers'];
	$extra = $_POST['extra'];
	$feedback = $_POST['feedback'];
	
	// Add to subjects list
         
      $query = "INSERT INTO cati_2 (ip, date, data, extra, feedback) VALUES ('{$ip}', '{$date}', '{$data}', '{$extra}', '{$feedback}')";
      mysql_query($query, $connection);
	

	//this gets the unique id for this participant
	//$returned_ID = mysql_insert_id($connection); 
	//echo $returned_ID;


	// Close connection
	mysql_close($connection);

?>


