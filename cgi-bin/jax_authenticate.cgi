#!/usr/bin/perl -wT

use strict;
use lib "/home/abrooks/www/chatterBox/script_src";
use Util;
use DbConfig;
use CGI qw /:standard/;
use CGI::Cookie;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
require '/home/abrooks/www/chatterBox/cgi-bin/config.pl';


$CGI::POST_MAX=1024 * 10;  # max 10K posts
$CGI::DISABLE_UPLOADS = 1;  # no uploads

my $userID = 0;
my $userName = 1;
my $userPass = 2;
my $startpage="/home/abrooks/www/chatterBox/web_src/chatterapp.html";
my $query = new CGI;
my $host = $::GLOBALS->{HOST}; # !!! change for production server to dcoda.net

my $dbconf = DbConfig->new();
my $dbh = DBI->connect( "dbi:mysql:"  
		. $dbconf->dbName() . ":"
		. $dbconf->dbHost(), 
		$dbconf->dbUser(), 
		$dbconf->dbPass(), $::attr )
        	or die "Cannot Connect to Database $DBI::errstr\n";

my $user_name = $query->param('userName');
my $user_pass = $query->param('userPass');

my $sqlstr = "select USER_ID, USER_NAME, USER_PASSWD from user "
		. " where USER_NAME = '" 
		. $user_name . "' and  USER_PASSWD = '" . $user_pass .  "'";
  
my $sth = $dbh->prepare($sqlstr);
$sth->execute();

my @user_row = $sth->fetchrow_array();
$sth->finish();

$dbh->disconnect();

if (not defined ($user_row[1])) {
	#---- CGI header response ----#
	print $query->header(-status=>'450 Invalid UserID/Password Entry',
			    );	
} else
{
	my $stockSessionID = Util::genSessionID();

	my $sessionInstance = "ses1";

	my $c1 = new CGI::Cookie(-name=>'stock_SessionID',
			-value=>$stockSessionID,
			-expires=>undef, 
			-domain=>$host,  
			-path=>'/');

	my $c2 = new CGI::Cookie(-name=>'stock_UserID',
			-value=>$user_name,
			-expires=>undef, 
			-domain=>$host, 
			-path=>'/');

	my $c3 = new CGI::Cookie(-name=>'Instance',
			-value=>$sessionInstance,
			-expires=>undef, 
			-domain=>$host,  
			-path=>'/');


	Util::storeSession($sessionInstance,
				$stockSessionID, 
				$user_row[$userName]);

	#---- CGI header response ----#
	print $query->header(-status=>200,
			     -cookie=>[$c1,$c2,$c3]
			    );

}

exit;
