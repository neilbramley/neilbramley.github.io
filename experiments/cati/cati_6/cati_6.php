<?php

	// Create a database connection
	$connection = mysql_connect("mysql-server.ucl.ac.uk","ucjtw3g_user","vXq37JTQc4J22R9uIITd");
	
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
	
	function debug_to_console( $data ) {

    if ( is_array( $data ) )
        $output = "<script>console.log( 'Debug Objects: " . implode( ',', $data) . "' );</script>";
    else
        $output = "<script>console.log( 'Debug Objects: " . $data . "' );</script>";

    echo $output;
	}
	

	// Get values passed from Flash
	$ip = $_SERVER['REMOTE_ADDR'];
	$date = date('Y-m-d');
	$data = $_POST['data'];
	$extra = $_POST['extra'];
	$feedback = $_POST['feedback'];
	

	// Add to subjects list
	//$query = "UPDATE cati_6 SET ip = '{$ip}', date = '{$date}', data = '{$data}', extra = '{$extra}', feedback = '{$feedback}';
    $query = "INSERT INTO cati_6 (ip, date, data, extra, feedback) VALUES ('{$ip}', '{$date}', '{$data}', '{$extra}', '{$feedback}')";
    mysql_query($query, $connection);	 

	// Close connection
	mysql_close($connection);

?>


