#!/usr/bin/perl -wT

use strict;
use lib "/home/abrooks/www/chatterBox/script_src";
use GenStatus;
use Error;
use GenError;
use Util;
use CGI qw /:standard/;
#use CGI::Carp qw(fatalsToBrowser);
#use CGI::Carp;
use DBI;
require '/home/abrooks/www/chatterBox/cgi-bin/config.pl';

 
my $query = new CGI;
my $callObj =  Util::formValidation($query);

print Util::headerHttp();
if (ref $callObj eq 'Error') {
#	GenError->new($callObj)->display("Invalid form submission\n");
	print "Invalid form submission\n";
	
} else {

	my $sqlHash = $callObj;

	#'$sqlHash->{userName}','$sqlHash->{userName}','$sqlHash->{password}'," 
	#				. "'$sqlHash->{firstName}','$sqlHash->{lastName}','$sqlHash->{address1}','$sqlHash->{address2}',"
	##				. "'$sqlHash->{zipcode}','$sqlHash->{phone}','$sqlHash->{email}','$sqlHash->{state}','$sqlHash->{city}')";





#	GenStatus->new()->display("Registration successful for $sqlHash->{userName}\n");
	print "Registration successful for $sqlHash->{userName}\n";
}

exit;




