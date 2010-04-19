#!/usr/bin/perl -wT

use strict;
use lib "/home/abrooks/www/chatterBox/script_src";
use Util;
use DbConfig;
use CGI qw /:standard/;
use CGI::Cookie;
use CGI::Carp;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
require '/home/abrooks/www/chatterBox/cgi-bin/config.pl';

$CGI::POST_MAX=1024 * 10;  # max 10K posts
$CGI::DISABLE_UPLOADS = 1;  # no uploads

my $query = new CGI;
my $initSessionObject = Util::validateSession();


if (ref $initSessionObject eq 'SessionObject')
{
        #TO DO: Restructure handling of db login failure
        my $dbconf = DbConfig->new();
        my $dbh = DBI->connect( "dbi:mysql:"
                        . $dbconf->dbName() . ":"
                        . $dbconf->dbHost(),
                        $dbconf->dbUser(),
                        $dbconf->dbPass(), $::attr )
                        or die "Cannot Connect to Database $DBI::errstr\n";

        my $sqlstr = ();
        my $sqlstr2 = ();
	my $sqlstr3 = ();
        my $sth = ();
        my $room_array = ();
        my $row_count = ();
        my $msg_user_array = ();
	my $msg_queue_array = ();

	my $userID = $query->param('userID');
	my $roomID = $query->param('roomID');

	if($query->param('req') eq 'ajaxPing')
	{
		my @user_cr_row = ();

		$sqlstr = "select * from user_cr where user_id = $userID";
		$sqlstr2 = "select user_id from user_cr where room_id = '$roomID'";		

		eval {		
			#one exec sequence
			@user_cr_row = $dbh->selectrow_array($sqlstr);
			#second exec sequence
			$sth = $dbh->prepare($sqlstr2);
						
			$sth->execute();
		
			$msg_user_array = $sth->fetchall_arrayref;	

			$sth->finish();
		
		};	

		if($@) 
		{
			print $query->header(-status=>'452 Application Error'
						);	
		}
		else
		{
			$sqlstr2 = "select * from chat_room_queue "
				 . " where msg_user_id = $userID "
				 . " and insert_ts >= $user_cr_row[2] "
				 . " order by cr_queue_id desc limit 2 ";
			
			eval {		
	
				my $sth = $dbh->prepare($sqlstr2);
	
				$sth->execute();
	
				$msg_queue_array = $sth->fetchall_arrayref;	
	
				$sth->finish();
	
			};	
				
			if($@) 
			{
				print $query->header(-status=>'452 Application Error'
							);	
			}	
			elsif(scalar(@{$msg_queue_array}) > 0)
			{
				$sqlstr3 = "delete from chat_room_queue "
					 . "where cr_queue_id = " . @{$msg_queue_array}[0]->[0]; 
				
				for(my $i=1; $i < scalar(@{$msg_queue_array}); $i++)
				{
					$sqlstr3 .= "or cr_queue_id = " . @{$msg_queue_array}[$i]->[0]; 

				}				

				eval {		
		
					my $sth = $dbh->prepare($sqlstr3);
		
					$sth->execute();
		
					$msg_queue_array = $sth->fetchall_arrayref;	
		
					$sth->finish();
		
				};	
				
				if($@)
				{
					print $query->header(-status=>'452 Application Error'
							);	
				}
				else
				{


					#all done return JSON_CO to client
					my $json_co = ();
					my ($msg_user_id,$room_id,$msg_text,$time_stamp,$msg_q_id) = (5,2,4,3,0);
					my $i = 0;
					$json_co = " json_var = { "
						 . " msg0 : { "
						 . "		user_id : " . @{$msg_queue_array}[$i]->[$msg_user_id]	. ", "
						 . "		room_id : " . @{$msg_queue_array}[$i]->[$room_id] 	. ", "
						 . "		msg_text : " . @{$msg_queue_array}[$i]->[$msg_text]	. ", "
						 . "		msg_q_id : " . @{$msg_queue_array}[$i]->[$msg_q_id]	. ", "
						 . "		time_stamp : " . @{$msg_queue_array}[$i]->[$time_stamp]	. " "
						 . " } " ;
					
						
					for(++$i; $i < scalar(@{$msg_queue_array}); $i++) 
					{
						$json_co .= " " 
						 . ",\n msg$i : { "
						 . "		user_id : " . @{$msg_queue_array}[$i]->[$msg_user_id]	. ", "
						 . "		room_id : " . @{$msg_queue_array}[$i]->[$room_id] 	. ", "
						 . "		msg_text : " . @{$msg_queue_array}[$i]->[$msg_text]	. ", "
						 . "		msg_q_id : " . @{$msg_queue_array}[$i]->[$msg_q_id]	. ", "
						 . "		time_stamp : " . @{$msg_queue_array}[$i]->[$time_stamp]	. " "
						 . " } \n" ;

					}

					my $js_msg_user_array = ();
					
						if (scalar(@{$msg_user_array}) > 1) 
						{
							$js_msg_user_array = " msg_user_ids : [ ";
							my $i = 0;

							$js_msg_user_array .= "'" . @{$msg_user_array}[$i]->[0] . "'"; 
				
							for(++$i; $i < scalar(@{$msg_user_array}); $i++) 
							{
								$js_msg_user_array .=  ", '" . @{$msg_user_array}[$i]->[0] ."'";
							}
		
							 $js_msg_user_array .= " ] ";
						}
					
					$json_co .= ",\n $js_msg_user_array "
						 .  " }; ";


					print $query->header(-status=>'200 OK',
								-Content_Type=>'text/javascript'
								);

					print $json_co;

				}
			}


		}
	}



}
