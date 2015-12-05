class Logger{
    static logger:Logger = new Logger();
    logToConsole:boolean=true;
    log(message:String){
        if(this.logToConsole){
            console.log(message);
        }
    }
}