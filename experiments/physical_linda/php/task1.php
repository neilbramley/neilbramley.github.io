<?php header('Access-Control-Allow-Origin: *'); 


$db_type           = "mysql";
$db_server         = "warehouse.cims.nyu.edu";
$db_name           = "bramley_neil";
$db_user           = "bramley";
$db_password       = "qmg7rdj5";

$db_link = mysql_connect($db_server, $db_user, $db_password);
if (!$db_link)
    die("Could not connect: " . mysql_error());
echo nl2br("Connected successfully\n");

$db_selected = mysql_select_db($db_name, $db_link);
if (!$db_selected) 
    die("Can't use \"$db_name\" : " . mysql_error());
echo nl2br("Selected successfully\n");

// Get values passed from elsewhere
$ip = $_SERVER['REMOTE_ADDR'];
$date = date('Y-m-d');
$upi = $_POST['upi'];
$trial = $_POST['trial'];

$query = "INSERT INTO p_linda1 (ip, date, upi, trial) VALUES ('{$ip}', '{$date}', '{$upi}', '{$trial}')";
mysql_query($query, $db_link);

mysql_close($db_link);

?>