<?php
if(!empty($_GET['data'])) {
	// echo $_GET['data']."<br>";
	// echo $_GET['id'];
    $logfile = fopen($_GET['id'].$_GET['version'].'.txt', 'a+');
    fwrite($logfile, $_GET['data']);
    fclose($logfile);
}
?>