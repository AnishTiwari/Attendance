export class Home{
  id :Number;
  start_date :Date;
  roll_no :Number;
  end_date: Date;
  reason : String;
  additional_comments :String;
  logged_time :Date;
  status :String;
  filename :String;

}

export class Homes{
  homes: Home[];
}
export class HomeLeave{
  data: Homes;
}
